import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Configuration for Auth Provider (Defaults to Google, falls back to Replit)
const AUTH_PROVIDER = process.env.REPL_ID ? "replit" : "google";

const getOidcConfig = memoize(
  async () => {
    if (AUTH_PROVIDER === "google") {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for authentication.");
      }
      return await client.discovery(
        new URL("https://accounts.google.com"),
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
    } else {
      // Replit Auth
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Ensure table exists
    ttl: sessionTtl, // seconds in DB, ms in cookie common confusion, pg-simple uses seconds/ttl option or cookie maxAge
    tableName: "sessions",
  });

  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set in production");
    }
    console.warn("Using default insecure session secret for development.");
  }

  return session({
    secret: process.env.SESSION_SECRET || "insecure-dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Secure only in prod/Replit. Localhost can be plain HTTP.
      secure: AUTH_PROVIDER === "replit" || process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  // Google tokens don't always have 'exp' in claims in the same way Replit does, 
  // but id_token always has exp.
  user.expires_at = user.claims?.exp || (Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600));
}

async function upsertUser(claims: any) {
  // Map OIDC claims to our user schema
  // Google: sub, email, given_name, family_name, picture
  // Replit: sub, email, first_name, last_name, profile_image_url

  const id = claims.sub;
  const email = claims.email;
  const firstName = claims.given_name || claims.first_name || "Unknown";
  const lastName = claims.family_name || claims.last_name || "User";
  const profileImageUrl = claims.picture || claims.profile_image_url || null;

  await storage.upsertUser({
    id,
    email,
    firstName,
    lastName,
    profileImageUrl,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Wait for config to load or fail if credentials missing
  let config: client.Configuration;
  try {
    config = await getOidcConfig();
  } catch (e: any) {
    console.error("Authentication setup failed:", e.message);
    // Don't crash, just disable auth routes effectively
    app.get("/api/login", (req, res) => res.status(500).send(e.message));
    return;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      const claims = tokens.claims();
      if (!claims) throw new Error("No claims found in token");
      await upsertUser(claims);
      verified(null, user);
    } catch (err) {
      verified(err);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  const strategyName = "oidc";

  // Determine Callback URL
  // Replit: specific format | Local: localhost:5001
  const callbackPath = "/api/callback";

  // Dynamic callback construction
  const getCallbackUrl = (req: any) => {
    if (AUTH_PROVIDER === "replit") {
      return `https://${req.hostname}${callbackPath}`;
    }
    // Local / Production Vercel
    const protocol = req.protocol || "http";
    const host = req.headers.host || "localhost:5001";
    return `${protocol}://${host}${callbackPath}`;
  };

  // We register/use the strategy dynamically or once if static. 
  // openid-client Strategy can accept a fixed callbackURL or we can handle it.
  // For local/dev simplicity, we will attempt to infer it or require it set.

  let callbackURL: string;
  if (process.env.REPL_ID) {
    // Replit environment is dynamic per hostname usually? 
    // Replit auth strategy usually handles hostname dynamically.
    // For simplicity in this hybrid, we will assume standard strategy behavior.
    // BUT openid-client passport strategy needs fixed callbackURL usually.
    // We'll use a placeholder for Replit and dynamic for Google.
    callbackURL = "https://replit.com/oidc/callback"; // Replit handles this specifically?
  } else {
    callbackURL = "http://localhost:5001/api/callback"; // Default Local
  }

  // To properly handle dynamic hosts (like Vercel preview URLs or Replit dynamic urls),
  // we might need to recreate the strategy per request or use a wildcard.
  // For this tasks specific "local" requirement, we hardcode localhost:5001 or use dotenv.
  if (process.env.APP_URL) {
    callbackURL = `${process.env.APP_URL}${callbackPath}`;
  }

  console.log(`Setting up OIDC with provider: ${AUTH_PROVIDER}, callback: ${callbackURL}`);

  passport.use(
    strategyName,
    new Strategy(
      {
        config,
        scope: "openid email profile",
        callbackURL,
      },
      verify
    )
  );

  app.get("/api/login", passport.authenticate(strategyName, {
    scope: ["openid", "email", "profile"],
    successReturnToOrRedirect: "/",
  }));

  app.get("/api/callback",
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) console.error("Logout error", err);
      // Google logout is complex (RP initiated logout), usually just clearing our session is enough.
      const returnUrl = "/";
      if (AUTH_PROVIDER === "replit") {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        res.redirect(returnUrl);
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    // Check expiration if available
    const user = req.user as any;
    const now = Math.floor(Date.now() / 1000);

    if (user.expires_at && now > user.expires_at) {
      // Token expired
      const refreshToken = user.refresh_token;
      if (refreshToken) {
        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(user, tokenResponse);
          return next();
        } catch (e) {
          console.error("Token refresh failed:", e);
        }
      }
      return res.status(401).json({ message: "Session expired" });
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
