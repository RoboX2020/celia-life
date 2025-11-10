# MedVault Demo - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design Principles adapted for Healthcare
**Justification:** Medical document management requires clarity, trust, and efficiency over visual flair. Users need to quickly find, upload, and review critical health information. The interface should feel professional, secure, and calming—reducing cognitive load in what can be a stressful context.

**Core Principles:**
1. **Clinical Clarity:** Information hierarchy that makes document types, status, and actions immediately scannable
2. **Trust Through Consistency:** Predictable patterns that build user confidence in the system's reliability
3. **Calm Professionalism:** Subdued, medical-appropriate aesthetic without sterile coldness

---

## Typography

**Font Stack:** Inter (via Google Fonts CDN)
- **Display/Headings (h1, h2):** 600 weight, 28px-36px
- **Subheadings (h3, h4):** 600 weight, 18px-24px
- **Body Text:** 400 weight, 16px (15px mobile)
- **Labels/Metadata:** 500 weight, 14px
- **Captions/Timestamps:** 400 weight, 13px, muted color treatment

**Hierarchy Rules:**
- Page titles: Large, bold, single-line clarity
- Section headers: Medium weight, clear separation from content
- Document titles: Prominent enough to scan quickly in lists
- Metadata labels: Smaller, subdued but readable

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Card padding: p-6
- Section margins: mb-8, mb-12
- Component gaps: gap-4, gap-6
- Button padding: px-4 py-2, px-6 py-3 (larger CTAs)

**Grid Structure:**
- Sidebar filter panel: Fixed 240px width on desktop, collapsible on mobile
- Main content: max-w-6xl with px-6 for breathing room
- Document cards: Grid 1 column mobile, 2 columns tablet (md:grid-cols-2)
- Detail view: Single column, max-w-3xl for optimal reading

**Container Strategy:**
- Dashboard: Full viewport height with sticky sidebar
- Upload zone: Prominent position, always visible at top of content area
- Document list: Scrollable region below upload zone

---

## Component Library

### Navigation Bar
- Height: h-16
- Fixed position with subtle shadow
- Logo left, user info right
- Background: solid white with border-b

### Sidebar Filter Panel
- Fixed width: 240px desktop
- Sticky positioning
- Filter buttons: Full width, left-aligned text
- Active state: Filled background with accent color
- Badge counts: Right-aligned within each filter button

### Upload Panel
- Large drag-drop zone: min-h-48, dashed border (border-2 border-dashed)
- Central icon + text layout
- "Select files" button: Primary CTA style
- File upload status: Inline list below drop zone with progress indicators
- Accepted formats: Small text below main CTA

### Document Cards (List View)
- Border: border rounded-lg
- Hover: Subtle shadow elevation change
- Layout: Horizontal split - metadata left, actions right
- Document type badge: Top-left, pill shape with subtle background
- Date: Small, muted, top-right
- Actions: Icon buttons, revealed on hover (desktop)

### Document Type Badges
- Pill shape: px-3 py-1, rounded-full
- Text: 12px, 600 weight, uppercase tracking
- Distinct but subtle background tints for each type
- Icons optional but recommended (small, left of text)

### Detail View Layout
- Hero section: Document title + type badge + key metadata
- Metadata grid: 2 columns on desktop, labeled key-value pairs
- Summary section: Card with subtle background, generous padding
- Original file section: Prominent download button

### Buttons
- Primary CTA: Filled, rounded, medium size (px-6 py-3)
- Secondary: Outlined or ghost style
- Icon buttons: 40x40px touch target, rounded
- Hover states: Subtle background change, no dramatic effects

### Empty States
- Centered icon (96px size, muted color)
- 1-2 line message
- Optional CTA to encourage action
- Generous vertical spacing (py-16)

### Status Indicators
- Upload progress: Horizontal bar with percentage
- Processing: Spinning icon + text
- Success: Checkmark icon, green accent
- Error: Alert icon, red accent with message

---

## Accessibility & Interactions

- All interactive elements: Minimum 44x44px touch targets
- Focus states: 2px outline offset for keyboard navigation
- Form inputs: Consistent height (h-10), clear labels above
- Error messages: Red accent, inline below relevant field
- Loading states: Clear visual feedback, no content jumping
- Skip links: For keyboard users to bypass navigation

---

## Animations

**Minimal, Purposeful Only:**
- Upload progress: Smooth bar animation
- Card hover: 150ms ease transition on shadow
- Filter selection: Instant, no transition
- Toast notifications: Slide in from top-right, 3s auto-dismiss
- **Avoid:** Page transitions, scroll effects, decorative animations

---

## Images

**No hero image required** for this utility application. The interface is information-dense and task-focused.

**Icon Usage:**
- Use Heroicons (outline style) via CDN
- Document type icons in badges (16px)
- Upload zone icon (48px)
- Empty state icons (96px)
- Action buttons (20px)

**File Thumbnails (future consideration):**
- For images: Small preview thumbnails in list view
- For PDFs: Generic document icon
- Consistent size: 48x48px in cards

---

## Key Implementation Notes

1. **Desktop-first filtering:** Sidebar always visible on large screens
2. **Mobile adaptation:** Sidebar converts to modal/drawer
3. **Upload feedback:** Real-time status is critical—never hide upload progress
4. **Document type color coding:** Subtle but consistent across all UI instances
5. **Safe medical aesthetic:** Professional blues/grays, avoid bright colors except for status indicators (success green, error red)