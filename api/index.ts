// @ts-ignore - this file is generated at build time
import { app, setupPromise } from "../dist-server/index.js";

export default async function handler(req: any, res: any) {
    await setupPromise;
    app(req, res);
}
