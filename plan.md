# Implementation Prompt: Reimagine and Rebuild Chroma

## 1. Role and mission

Act as a senior product designer, design engineer, UX strategist, and frontend architect. Reimagine and rebuild **Chroma**, the colour catalogue and studio tools in this repository, as a cohesive, production-ready product.

Treat the current interface as evidence of product capabilities, not a design or information-architecture template. Decide which existing features still serve the product, improve or replace weak interactions, and make the result feel like a purposeful colour-work environment rather than a generic dashboard or collection of unrelated utilities.

Keep the existing Astro, React, TypeScript, and static deployment stack unless repository inspection reveals a concrete reason to change it. Preserve existing catalogue data and valid colour calculations. Do not add a backend, account system, external service, fabricated content, or new product claim without a clear need.

Inspect before editing. Preserve unrelated user work and avoid destructive commands. Make reasonable product and implementation decisions without repeated approval requests. Ask only when missing information would materially change the product. Reuse suitable assets, use realistic content and states, and update documentation if architecture or setup changes.

## 2. Repository findings

Confirm these findings against the checkout before implementation. If the repository has changed, update the plan and report the discrepancy.

- **Framework and build:** Astro 7 static output, React 19 islands, TypeScript, Tailwind CSS 4 through Vite. Node.js 24.21+ and npm are specified. Static pages are built with `astro build`; no server adapter or API routes are configured.
- **Deployment:** GitHub Pages at `https://error420notfound.github.io/chroma`. `astro.config.mjs` uses a `/chroma` production base and `/` in development. Internal routes and assets must remain base-aware. `.github/workflows/deploy.yml` installs dependencies, runs `npm run check` and `npm run build`, then deploys `dist`.
- **Routes:**
  - `/` — catalogue browser
  - `/scales/` and `/scales/[slug]` — scale catalogue and detail pages
  - `/engineered/` and `/engineered/[slug]` — engineered hue catalogue and detail pages
  - `/compare` — colour comparison workspace
  - `/gradients` — gradient builder
  - `/contrast` — contrast checker
- **Shared layout:** `src/layouts/BaseLayout.astro` provides the site header, search, navigation, and a shared fullscreen swatch overlay.
- **Interactive components:** `src/components/` contains catalogue, scale-step, engineered-hue, search, comparison, gradient, contrast, and copy-button components. Most tools are React islands hydrated with `client:load`.
- **Data and domain logic:** `src/data/hue-scales/` and `src/data/engineered-hues/` hold JSON records. `src/lib/catalogue.ts` defines Zod schemas and eagerly imports JSON from each `source/` directory, excluding its index file. It derives the display catalogue from those source records. Manifests exist but are not used by that import path. Also inspect the separate JSON files outside `source/` and resolve whether they are obsolete examples, intended content, or a source-of-truth ambiguity before changing data handling.
- **Colour and tools:** `src/lib/colour.ts` uses Color.js for contrast, gamut checks, and CSS values. `src/lib/catalogueFilters.ts` handles hue classification, harmony, and sorting. `src/lib/gradients.ts` builds CSS gradients and samples them. `src/lib/storage.ts` wraps browser `localStorage`.
- **Persistence and sharing:** comparison selections are stored in local storage and reflected in a query parameter. Gradient stops are stored in local storage. There is no server-side persistence, CMS, authentication, or analytics integration.
- **Styling:** `src/styles/global.css` is a large global stylesheet with design tokens, component styling, responsive rules, dark-mode variables, and motion rules. Pages also use inline styles. The active visual system is a paper-and-ink palette, sharp corners, and a restrained blue accent.
- **Scripts:** `npm run dev`, `build`, `preview`, `check`, `lint`, and `format:check` are available. No test files or test script were found in the inspected repository.
- **Constraints:** Keep static routes, browser-only persistence, accurate colour data, colour-space handling, and GitHub Pages subpath routing working. A server-backed feature is out of scope unless the product cannot work well without it; explain the reason and migration plan before introducing one.

## 3. Skill and reference mapping

Use the repository’s local skills as governing design references. Read the relevant skill and referenced files from the local paths below; do not substitute guessed skill names, remote APIs, or unverified guidance. Translate Apple HIG principles into responsive web behavior. Do not imitate Apple’s visual identity or native chrome.

| Skill or reference file | What it governs | Where it must be applied | Important constraints |
|---|---|---|---|
| `.agents/skills/apple-informed-web-experience-design/SKILL.md` | Website proposition, hierarchy, copy, responsive marketing patterns, web-native behavior | Product positioning, landing experience, navigation, page content, primary actions, and responsive implementation | Do not invent proof, claims, or commercial conversion goals. This is a colour workspace, not an ecommerce storefront. |
| `.agents/skills/apple-informed-web-experience-design/references/page-strategy.md` | Page purpose, first viewport, content sequence | Home/library entry, tool landing states, scale and hue details | Make the product and next action clear; do not treat a fixed “fold” as a design rule. |
| `.agents/skills/apple-informed-web-experience-design/references/copy-and-conversion.md` | Clear, trustworthy content and action labels | Headings, descriptions, form labels, empty/error/success copy | Use verifiable statements and precise actions; do not invent testimonials or impact claims. |
| `.agents/skills/apple-informed-web-experience-design/references/disclosure-and-motion.md` | Progressive disclosure and web motion behavior | Filters, advanced colour controls, dialogs, tool feedback, transitions | Keep essential information available without hover or animation; define reduced-motion behavior. |
| `.agents/skills/apple-informed-web-experience-design/references/hig-routing.md` and `references/hig/` | Routes to the relevant supplied HIG snapshots and explains web translation | Layout, typography, colour, accessibility, branding, writing, controls, and motion decisions | Treat HIG as guidance, not as a native-web specification. Use the supplied local files and cite their filenames in implementation notes when a specific principle drives a choice. |
| `.agents/skills/apple-adaptive-layouts/SKILL.md` | Responsive adaptation as task continuity across viewports and inputs | Catalogue, detail pages, workbench, navigation, filters, dialogs, resize behavior | Specify transformations and preserved state, not just scaled screenshots. Do not map Apple size classes directly to CSS breakpoints. |
| `.agents/skills/apple-adaptive-layouts/references/hig/layout.md`, `designing-for-ios.md`, `accessibility.md` | Layout and compact web context, inclusive behavior | Mobile composition, reflow, text scaling, focus and interaction | Apply web semantics, browser zoom, and responsive behavior rather than native safe-area or point conventions. |
| `.agents/skills/apple-adaptive-layouts/references/hig/virtual-keyboards.md`, `keyboards.md`, `pointing-devices.md` | Input and occlusion behavior | Search, editable colour values, controls, keyboard and pointer operation | Keep focused controls and results usable with a virtual keyboard, hardware keyboard, touch, or pointer. |
| `.agents/skills/apple-adaptive-layouts/references/hig/collections.md`, `lists-and-tables.md`, `motion.md` | Dense collections, structured data, and motion | Catalogue layouts, scale steps, comparison views, state changes | Preserve meaning and selection when density or pane structure changes; don’t use motion as the only feedback. |
| `.agents/skills/apple-platform-ui-design/SKILL.md` | Platform behavior and interaction quality, including on Apple devices | Responsive web interaction decisions on iPhone, iPad, and Mac | Translate intent to web patterns; do not add native APIs or system controls that the website cannot support. |
| `.agents/skills/apple-platform-ui-design/references/reference-map.md` and relevant files in `references/hig/` | Routes to platform-specific guidance | Use the web/PWA, target-platform, layout, accessibility, and component references relevant to the chosen interface | Read only relevant references; distinguish native-platform behavior from web implementation. |
| `.agents/skills/apple-ui-concept-art-direction/SKILL.md` | Product-led visual direction, distinctive brand expression, credible interface states | Visual concept and design-system decisions | Use for art direction, not as a reason to generate concept images. Avoid decorative gradients, glass, neon, and oversized type that do not clarify a colour task. |
| `.agents/skills/apple-ui-concept-art-direction/references/reference-map.md` and relevant files in `references/hig/` | Visual reference routing for brand, colour, typography, layout, accessibility, motion, and components | Palette, type, surfaces, icons, content density, and motion choices | Maintain Chroma’s own identity and web behavior. Read `.agents/skills/apple-ui-concept-art-direction/references/image-brief-template.md` only if an image concept is actually part of the implementation. |

Before coding, record which local references you actually read and map the major design choices to them. Do not claim a skill or reference was applied if it was not consulted.

## 4. Product diagnosis

Chroma is currently a static colour library for inspecting hue scales and engineered colours, with tools for comparing selected colours, building gradients, and checking text contrast. The primary users are likely designers and developers choosing, checking, comparing, and exporting colour values for interface or visual-system work. Treat that audience as an informed working assumption, not as a proven research finding.

### Existing strengths to preserve

- Useful colour records with HEX, OKLCH, and Display-P3 values.
- Eleven-step hue-scale records and a distinct engineered-hue collection.
- Real colour calculations through Color.js rather than hand-written approximations.
- Practical comparison, gradient, contrast, search, copy, and local persistence features.
- Static generation and browser-local data keep deployment simple and avoid requiring accounts.
- A searchable catalogue with hue, lightness, chroma, collection, harmony, and sorting concepts.

### Friction and technical debt to address

- Six top-level navigation links treat the library and tools as peers, making the product structure unclear.
- The homepage, catalogue, detail, and tools do not express one coherent journey from discovery to use.
- Catalogue filters are crowded into a sidebar on desktop and reduced to a limited sticky bar on mobile; some controls become inaccessible in the compact layout.
- The mobile filter bar hides based on scroll direction, which can conceal useful controls unexpectedly.
- Scale details require horizontal scrolling through eleven large columns, especially awkward on narrow screens.
- Search uses listbox/option roles around links but does not provide a complete, predictable keyboard selection model or explicit focus behavior for results.
- Modals need reliable focus entry, focus containment, Escape handling, focus return, and URL/history behavior.
- Colour input fields in the contrast tool do not visibly validate malformed or unsupported values. Its pass/fail states need clearer explanation and accessible status semantics.
- The compare tool has URL and local-storage state, but its selection and derived-preview model needs clearer limits, invalid-ID handling, and share/reset behavior.
- The gradient builder’s animation repeats the same gradient frames, so it does not explain interpolation; its hue-direction control is not passed into gradient generation. Persisted or malformed stops also need validation and recovery.
- Copy behavior depends on Clipboard API success and has no error fallback. Feedback must be available to assistive technology.
- Fullscreen behavior is implemented through a shared inline script that clones interface markup. It needs an accessible, maintainable pattern and graceful fallback if browser fullscreen is unavailable.
- Filter controls, dialog semantics, SVG pointer interactions, focus states, touch targets, and result announcements need a complete accessibility review.
- The global CSS combines unrelated page styles, includes inline style use across components, and has only limited responsive breakpoints. Dark-mode tokens exist, but the product needs a deliberate, tested appearance strategy.
- Data manifests are present but the catalogue loader imports all source JSON records directly. The unused manifests and duplicate top-level records create a source-of-truth risk.
- The README describes starter records and catalogue setup; reconcile it with the actual imported data model and deployment configuration.

## 5. New product direction

### Concept

Position Chroma as a **working colour library and colour decision workbench**: a place to find an existing colour, understand its role and values, test it in context, compare alternatives, and carry the result into code.

The product promise should be specific and modest: **“Find, inspect, test, and export colour decisions from one browser-based library.”** Do not claim professional validation, guaranteed accessibility, or production readiness for a palette unless the data supports that claim.

### Experience principles

1. **Start with the colour library.** Make discovery and inspection the default entry point, not a marketing hero or empty dashboard.
2. **Connect tools to real records.** Users should be able to move from a colour or scale into compare, contrast, or gradient work without losing context.
3. **Show values and meaning together.** Swatches must have readable names, roles or collection context where known, and copyable values. Colour alone must never carry meaning.
4. **Keep source and derived results distinct.** Label original catalogue values separately from computed previews and user-created drafts.
5. **Make browser-local behavior explicit.** State when a workspace is stored only in this browser and offer clear reset/export behavior.
6. **Make dense work adaptable.** On larger screens, support side-by-side inspection and efficient comparison. On smaller screens, preserve the full task through stacked layouts and deliberate disclosure.
7. **Use colour as the product material.** Let real catalogue swatches create the visual identity. Avoid competing decorative colour effects.

## 6. New information architecture

Use a concise primary navigation organized around **Library** and **Workbench**. Keep the collection types and tool destinations discoverable without rendering all destinations as equal-weight top-level links.

### Routes

Preserve current routes for compatibility and direct links:

- `/` — Library landing and catalogue
- `/scales/` — Hue scales
- `/scales/[slug]` — Hue scale detail
- `/engineered/` — Engineered hues
- `/engineered/[slug]` — Engineered hue detail
- `/compare` — Compare workspace
- `/gradients` — Gradient workbench
- `/contrast` — Contrast checker

You may add routes only when they provide a meaningful, content-backed purpose. Keep canonical detail pages addressable by URL. If adding a new route, ensure static generation and GitHub Pages base-path behavior work.

### Navigation model

- **Primary:** Library, Workbench, Search.
- **Library secondary navigation:** All colours, Hue scales, Engineered hues.
- **Workbench secondary navigation:** Compare, Gradients, Contrast.
- Show the current location clearly and preserve standard browser navigation.
- Search should be available throughout the app without obscuring primary navigation.
- On narrow screens, use a compact menu or horizontally scrollable labelled navigation with visible current state. Do not hide essential destinations or require hover.
- Provide breadcrumbs on detail pages: Library → collection → item.

### Key journeys

1. **Find and use a colour:** Search or filter → inspect swatch and metadata → copy a value or open detail → add to compare or another tool.
2. **Understand a scale:** Browse scales → open one scale → compare all eleven steps and their values → copy a step or export the scale.
3. **Compare alternatives:** Add two to eight catalogue entries → reorder/remove → inspect source and derived previews → share via URL or export.
4. **Build a gradient:** Add two to eight stops → edit order, values, and positions → choose interpolation space and hue direction → inspect a useful preview → copy CSS.
5. **Check contrast:** Choose catalogue or custom foreground/background → see ratio and standard results → understand which text/UI thresholds pass → adjust values or copy results.

## 7. Screen-by-screen specification

For every screen, implement loading, empty, invalid, success, and error states appropriate to its real data and interaction. Because the current app is statically generated and locally computed, do not invent network-loading states; use them only if a real asynchronous dependency is introduced.

### `/` — Library

- **Purpose/user intent:** Let a designer quickly find and inspect a colour or collection.
- **Layout:** A compact product introduction, prominent search, clear collection choices, then a catalogue grid with an always-visible result count and active filter summary.
- **Content hierarchy:** Product purpose → search and collection entry points → filter/sort controls → colour results. Avoid a large ornamental hero.
- **Components/actions:** Search; collection switcher; filters for hue, lightness, chroma, and family where data supports them; sort; reset filters; open detail; copy HEX; add to compare.
- **States:** No matches with a one-action reset; active filter chips; empty catalogue fallback if data is unavailable; selected/added feedback.
- **Responsive:** Desktop/tablet can use a filter column or collapsible filter panel beside results. Mobile uses a labelled filter button that opens an accessible sheet or disclosure panel, plus a compact result toolbar. Do not hide controls based on scroll direction.
- **Accessibility/motion:** Semantic list/grid structure, descriptive colour names and values, keyboard-operable filters, result-count announcement after applying filters, visible focus, no motion-only indication.
- **Data:** Derived catalogue from validated local JSON.

### `/scales/` — Hue scales

- **Purpose/user intent:** Find a scale suitable for a system or compare available scale families.
- **Layout/content:** Collection introduction, scale count, searchable or filterable scale cards with a useful central-step preview, name, family, description, and eleven-step indication.
- **Actions/states:** Open scale; no-match or empty-data state; preserve clear path back to the library.
- **Responsive/accessibility:** Cards reflow from multi-column to single-column without truncating the meaningful name or description. Treat each card as one link with a clear accessible name.

### `/scales/[slug]` — Scale detail

- **Purpose/user intent:** Inspect the progression and copy values from a scale.
- **Layout/content:** Breadcrumb, name and description, compact scale overview, then all eleven steps with step number, label, swatch, HEX, OKLCH, Display-P3, and copy controls. Include reference colours and contrast examples only when present in the record.
- **Actions:** Copy each format; compare selected steps; export the full scale if that can be done accurately; move to adjacent scale.
- **States:** Unknown slug should produce a deliberate not-found page or redirect that remains valid under `/chroma`; optional record sections should simply be omitted.
- **Responsive:** Wide screens can show a structured horizontal scale with labels and values. Tablet and mobile should use a responsive table/list or compact step selector plus a clearly linked detail panel. Do not require sideways scrolling to read all eleven values.
- **Accessibility/motion:** Preserve step order; use semantic headings and labels; focus should move predictably when selecting a step. If a dialog remains, implement full dialog behavior and focus restoration.

### `/engineered/` — Engineered hues

- **Purpose/user intent:** Browse high-impact individual hues.
- **Layout/content:** Collection introduction and a grid/list with real name, description, tags, HEX, and colour preview.
- **Actions:** Open canonical detail; copy; add to compare.
- **Responsive/accessibility:** Reflow naturally, preserve full content, use links to canonical detail pages instead of a modal that duplicates the detail route.

### `/engineered/[slug]` — Engineered hue detail

- **Purpose/user intent:** Inspect one hue and carry its values into a tool.
- **Layout/content:** Breadcrumb; prominent swatch; description and tags; HEX, OKLCH, and Display-P3; related scale only when a valid relationship exists.
- **Actions:** Copy individual/all values; add to compare; open related scale.
- **States/responsive/accessibility:** Provide a real not-found state. Stack swatch and values on mobile. Use text labels and accessible copy feedback; no full-screen control that traps or loses focus.

### `/compare` — Compare workspace

- **Purpose/user intent:** Compare two to eight existing catalogue colours without changing source data.
- **Layout/content:** Clear “add colour” action; selected-colour list; comparison view with original/derived mode; visible explanation of derived values; export/share controls.
- **Actions:** Add, remove, reorder, clear, switch preview mode, copy or export JSON/CSS, share a URL. Handle invalid, duplicate, missing, or over-limit IDs predictably.
- **States:** Empty state with direct “Add colours” action; restored workspace; invalid shared URL with recoverable message; copy/export confirmation.
- **Responsive:** Desktop can compare values in aligned columns. Mobile should use a clear stacked comparison with persistent access to add and export actions; do not shrink cards until values become unreadable.
- **Accessibility/motion:** Buttons have action-specific names; reordering has keyboard-accessible controls; changes are announced; preserve focus after add/remove/reorder.

### `/gradients` — Gradient workbench

- **Purpose/user intent:** Build a useful CSS linear gradient from catalogue colours or valid custom colours.
- **Layout/content:** Preview first, then stop editor, interpolation controls, output CSS, and export/copy actions. Explain how colour space affects interpolation.
- **Actions:** Add/remove/reorder stops, choose a catalogue or custom colour per stop, edit stop position, choose supported colour space and hue direction, pause/play any meaningful preview animation, copy CSS, reset.
- **States:** Safe defaults when storage is malformed; explicit limit at eight stops; validation for duplicate or non-monotonic positions if relevant; gamut warning with accurate fallback; empty/recovery state.
- **Responsive:** Preview spans full width. Each stop becomes a labelled stacked editor row on mobile; the position control and its numeric value remain together.
- **Accessibility/motion:** Support keyboard editing and text alternatives to sliders. Respect reduced motion. Animation must clarify a real property of the gradient; do not animate an identical repeated image as decoration. Ensure selected direction is actually used by the calculation.

### `/contrast` — Contrast checker

- **Purpose/user intent:** Evaluate a foreground/background pair and understand threshold results.
- **Layout/content:** Foreground and background editors beside a live preview; a prominent contrast ratio; clearly grouped WCAG threshold results with short plain-language distinctions.
- **Actions:** Choose a catalogue colour or enter a custom value; swap foreground/background; reset; copy values or report.
- **States:** Validate supported colour syntax and explain invalid input without replacing the last valid result unexpectedly. Distinguish incomplete input from a valid failing contrast result.
- **Responsive:** Stack editors and preview above the results. Keep the result visible without forcing side-by-side panels.
- **Accessibility:** Associate labels and help/error text with fields; announce result changes; do not signal pass/fail by colour alone; preserve readable sample text against both values.

### Shared search, copy, overlays, and not-found behavior

- Search should return grouped, understandable results with a complete keyboard model, Escape handling, focus behavior, and a useful no-results state.
- Copy controls should provide a fallback or actionable error when clipboard access fails. Announce success and failure accessibly.
- Avoid cloning live controls into fullscreen DOM. Prefer an accessible dialog or a simple expanded swatch view. If dialogs are used, implement Escape, focus entry/containment/restoration, backdrop behavior, and scroll handling.
- Add a useful static not-found page with a route back to Library.

## 8. Design system direction

Derive the final visual system from actual catalogue content and the local skill references. The following direction is a concrete starting point; adjust it if existing assets or data support a stronger coherent choice.

- **Identity:** An editorial colour reference tool: calm, precise, tactile, and information-rich. Let swatches carry the expressive colour; keep surrounding surfaces quiet.
- **Colour roles:** Define semantic tokens for page background, elevated surface, primary text, secondary text, borders, focus, selected state, success, warning, error, and data visualization. Do not use the same colour token for unrelated semantics.
- **Contrast:** Verify text and controls against both light and dark surfaces. Do not assume automatic text colour on a swatch guarantees contrast for every text size and use.
- **Appearance:** Support light and dark modes only if all tokens and sample previews remain legible and intentional. Respect system preference and avoid forcing dark mode. Verify the chosen implementation in both modes.
- **Typography:** Use a small, readable scale for interface copy and data. Establish clear levels for page title, section title, collection name, value label, helper text, and numeric colour values. Use tabular/monospaced numerals for codes where they improve scanning. Avoid tiny uppercase metadata as the only label.
- **Spacing/grid:** Use a consistent spacing scale, a centered max-width content container, and responsive result columns. Increase density on wider screens through useful simultaneous visibility, not oversized cards.
- **Borders/radii/elevation:** Define a small radius scale and restrained separators/elevation. Controls and cards should look related without making every region a floating panel.
- **Iconography:** Reuse installed Lucide icons where appropriate. Every icon-only control needs a visible tooltip or accessible name and a usable target.
- **Imagery:** The product’s real swatches are the primary visual material. Do not add stock imagery or generated abstract artwork unless it serves a demonstrated product need.
- **Component states:** Define default, hover, focus-visible, active, selected, disabled, invalid, success, and loading states where applicable. Ensure focus remains visible in either appearance mode.

## 9. Interaction and motion system

- Use native links for navigation and buttons for actions.
- Provide visible focus on all interactive controls; hover must not be required to reveal content or actions.
- Give touch targets a practical minimum of 44 CSS px where feasible, especially for primary mobile controls.
- Use pressed/selected feedback for filters, segmented choices, copy actions, and stop editing.
- Keep keyboard order aligned with visual and task order. Support Tab/Shift+Tab, Enter/Space, Escape where relevant, and arrow-key interaction only when the chosen component pattern calls for it.
- Search should support keyboard entry, result navigation, dismissal, and focus return.
- Dialogs/sheets must expose their state semantically and preserve the invoking control’s context.
- Filter changes should update the visible count and results without disorienting scroll position.
- Form validation should be inline, specific, and persistent long enough to correct. Do not clear a user’s valid draft because of one invalid edit.
- Loading should be immediate for static local data; use skeletons only for real delayed work.
- Motion must have a defined trigger and purpose. Keep transitions brief and interruptible. Respect `prefers-reduced-motion` and offer immediate state changes with equivalent feedback.
- Do not use scroll-jacking, autoplay motion that distracts from reading, or animated entrances that delay access to controls.

## 10. Responsive implementation

Use content and available space to choose transformations. Test at concrete widths including 320, 390, 768, 1024, 1280, and 1440 CSS px, plus resizable intermediate widths. These are test viewports, not mandatory breakpoint values.

| Context | Navigation and content | Controls and actions |
|---|---|---|
| Small mobile | Single-column content; compact branded header; menu or clearly scrollable navigation; card/list results | Filters open in a labelled sheet/disclosure; stop editors stack; compare cards stack; actions remain reachable above the virtual keyboard |
| Large mobile | Preserve the mobile task model with more room for inline summaries and preview | Keep main action visible near relevant content; do not restore desktop sidebars prematurely |
| Tablet portrait | Reflow to two-column collections where readable; catalogue filters can be a collapsible side panel or sheet | Keep filter state and selection when opening/closing the panel; forms may remain stacked |
| Tablet landscape | Use the extra width for simultaneous preview and editing; show a persistent filter or inspector pane when useful | Keep tool controls near their preview; avoid stretched form fields and excessively wide text |
| Desktop | Wider catalogue grid, useful filter rail, aligned compare columns, stable workbench preview/editor regions | Support pointer and keyboard efficiently; keep secondary commands discoverable |
| Wide desktop | Constrain reading width and expand only data/work areas that benefit from more columns or comparison | Avoid stretching paragraphs and tiny swatches across the viewport |

For every transformation, preserve active search, filters, selected items, draft values, and the current route. Verify virtual-keyboard behavior, browser zoom, text resizing, orientation changes, and window resizing. Do not use fixed widths that cause horizontal page overflow. Deliberate overflow inside a data visualization is acceptable only when an accessible alternative is available.

## 11. Accessibility requirements

Meet WCAG 2.2 AA wherever applicable and verify the actual implementation. At minimum:

- Use semantic landmarks, headings, lists, links, buttons, labels, and form controls.
- Make all functionality available by keyboard with visible focus.
- Give controls meaningful accessible names; decorative swatches and icons should not create noisy announcements.
- Ensure normal text contrast of at least 4.5:1 and large text/UI contrast as applicable. Treat the contrast tool’s result as guidance for tested values, not a guarantee that the whole interface is conformant.
- Do not communicate state by colour alone; pair colour with text, shape, or icon and an accessible announcement.
- Meet WCAG 2.2 target-size requirements; use 44px targets for primary touch controls where practical.
- Associate field instructions, errors, and validation state with their inputs.
- Announce result-count changes, copy success/failure, save/reset outcomes, and important calculation changes without repeatedly interrupting users.
- Implement accessible dialogs, menus, disclosures, and any tabs used. Avoid assigning ARIA roles that conflict with native links or controls.
- Respect reduced motion and do not make animated content essential.
- Support 200% zoom and text enlargement without clipped content or lost functionality.
- Verify reflow at narrow widths and prevent unnecessary two-dimensional scrolling.
- Include a skip link and a clear main-content landmark.

## 12. Technical architecture

Respect the current stack. Propose a migration only if a specific limitation makes the current approach unsuitable; document the benefit, risk, and staged migration.

### Components and boundaries

- Keep Astro responsible for routes, static content, metadata, and server/build-time data composition.
- Keep React islands for genuinely interactive workspaces, not every static content block.
- Refactor the shared layout into clear site shell, navigation, search, breadcrumbs, and footer components as needed.
- Create reusable, typed components for swatches, colour values, copy feedback, filter controls, empty/error states, and accessible dialogs.
- Separate catalogue collection/detail presentation from catalogue computation and validation.
- Remove duplicate modal/detail interactions when a canonical route serves the same purpose.
- Split the global stylesheet into coherent design tokens, base rules, and component/feature styles if that improves maintainability. Do not add a styling library without a clear reason.

### Routes, data, and state

- Preserve existing routes and static generation. Ensure generated links include the configured base path.
- Establish and document the source of truth for JSON records and manifests. Validate every included record at build time with Zod.
- Keep source catalogue values immutable. Model user drafts and derived previews separately.
- Validate local-storage data before use; version the schema and provide a safe fallback/reset path for malformed or obsolete data.
- Validate shared compare URLs, remove unknown IDs, enforce the two-to-eight selection limit, and preserve unrelated query parameters where appropriate.
- Keep tool calculations in typed domain functions that are independently understandable and reusable.
- Do not introduce a CMS, database, API, or authentication system for features that can be reliably completed with static data and local browser state.
- Define how browser-local data is cleared, exported, or recovered. Do not imply cross-device persistence.

### Errors, performance, SEO, analytics, deployment

- Handle invalid colour input, malformed storage, unavailable clipboard access, invalid routes, and unsupported gamut values without crashing.
- Keep initial JavaScript small and hydrate only interactive islands needed on a page.
- Avoid loading GSAP or another animation library on routes that do not need it. Prefer CSS or native browser behavior for simple transitions.
- Avoid layout shifts when islands hydrate; render meaningful static structure where possible.
- Set page-specific title, description, canonical URL strategy, and Open Graph metadata. Keep static pages indexable and ensure production paths work under `/chroma`.
- Do not add analytics without a concrete privacy-respecting requirement. If introduced, document data collected and user impact.
- Preserve the GitHub Pages workflow and build output unless a justified deployment change is required.
- Update `README.md` for the final route model, data-source rules, storage behavior, development commands, and deployment base path.

## 13. Implementation sequence

Before edits, summarize the files and component boundaries you intend to change. Inspect the current working tree and preserve unrelated work.

1. **Repository and dependency audit**
   - Reconfirm package scripts, Astro routes, source JSON structure, data manifests, CSS, GitHub Pages configuration, and existing uncommitted changes.
   - Resolve the active-data versus manifest ambiguity. Record dependencies that are unused or only needed for current animation behavior.
   - Output: a short implementation map and any confirmed constraints.

2. **Product and information architecture foundation**
   - Define the Library/Workbench navigation, routes, task journeys, page content model, and local persistence rules.
   - Output: route map and typed data/state boundaries.

3. **Design tokens**
   - Refactor `src/styles/global.css` or establish a clear token/style organization.
   - Define semantic colour, typography, spacing, container, border, radius, focus, and motion tokens.
   - Output: tokens tested in light/dark modes if both are retained.

4. **Global shell and navigation**
   - Refactor `src/layouts/BaseLayout.astro`; add shell/navigation/search/breadcrumb components as needed.
   - Ensure route active states and links work under `/chroma`.
   - Output: responsive shell, skip link, page metadata, and not-found handling.

5. **Core components**
   - Build typed swatch, value row, copy feedback, filter, notice, empty state, and accessible overlay primitives.
   - Output: reusable components with keyboard and screen-reader behavior.

6. **Primary user journey**
   - Rebuild `/`, `/scales/`, `/scales/[slug]`, `/engineered/`, and `/engineered/[slug]`.
   - Output: library discovery and inspect/copy flows with all catalogue data represented.

7. **Secondary user journeys**
   - Rebuild `/compare`, `/gradients`, and `/contrast` around the product model.
   - Output: functional, connected workspaces with recoverable URL/local data.

8. **Forms and data states**
   - Add validated colour entry, storage validation/versioning, invalid-route handling, clipboard fallback, export and reset feedback.
   - Output: explicit empty, invalid, error, success, and limit states.

9. **Responsive behavior**
   - Implement content-driven layouts for the six viewport contexts in section 10.
   - Output: no accidental page overflow and no lost control or data on resize.

10. **Accessibility**
    - Audit semantics, labels, contrast, focus, touch targets, dialog behavior, announcements, zoom, and reduced motion.
    - Output: resolved accessibility issues and recorded manual checks.

11. **Motion**
    - Add only purposeful feedback or spatial continuity transitions.
    - Output: motion behavior with reduced-motion equivalent; remove redundant animations.

12. **Performance**
    - Inspect bundle/build output, island hydration, layout stability, colour calculation cost, and asset use.
    - Output: no unnecessary client hydration or animation dependency.

13. **Testing**
    - Run existing `npm run check`, `npm run lint`, `npm run format:check`, and `npm run build`.
    - Add or configure focused automated tests for domain calculations, storage validation, URL state, and important interactions if no suitable test setup exists; keep test tooling proportionate.
    - Output: passing checks and coverage for the main user journeys.

14. **Deployment validation**
    - Build using production configuration and inspect generated paths/links under the `/chroma` base.
    - Output: deployment-ready static artifact and documentation for any configuration changes.

## 14. Acceptance criteria

### Product experience

- A first-time visitor can identify Chroma as a colour library and choose a clear next action without interpreting an abstract slogan.
- All current useful capabilities remain accessible through the new Library/Workbench model.
- A user can move from a catalogue item into comparison or another relevant tool while preserving their current context.
- Source values and derived/user-authored values are visibly distinguishable.
- Browser-local persistence is described accurately and can be reset or exported where appropriate.

### Visual design

- The interface uses one coherent design system across collection, detail, and tools.
- Swatches are prominent, but every colour decision is supported by readable labels and values.
- There are no generic dashboard cards, arbitrary ornamental charts, or decorative effects that compete with the task.
- Light/dark appearance, if provided, maintains legibility and intentional semantic colour roles.

### Responsive behavior

- At 320, 390, 768, 1024, 1280, and 1440px widths, every route remains usable without accidental page-level horizontal overflow.
- Scale data and form values remain readable without requiring users to pan across an oversized desktop table on mobile.
- Navigation, filters, comparison, stop editing, and primary actions transform deliberately rather than simply shrinking.
- Resizing preserves route, search/filter state, selection, and drafts.

### Accessibility and interaction

- All tasks work with keyboard only, with visible focus and predictable focus restoration.
- Dialogs and menus expose correct semantics and do not trap focus improperly.
- Form errors are associated with inputs; copy, save, result, and validation feedback is announced accessibly.
- Colour state is never indicated by colour alone.
- Reduced-motion mode removes nonessential movement while preserving immediate feedback.
- Zoom/text enlargement does not hide controls or truncate essential values.

### Data integrity and errors

- Every included catalogue record validates at build time.
- Invalid or obsolete local storage recovers to a safe default without breaking the page.
- Invalid compare IDs and malformed colour input produce a recoverable state.
- Gradient interpolation controls affect the generated output as labelled.
- Colour calculations and gamut fallback behavior are tested against representative inputs.

### Performance, SEO, and deployment

- Static pages remain indexable and have relevant page titles and descriptions.
- Interactive code hydrates only where needed; no unnecessary third-party services are introduced.
- `npm run check`, `npm run lint`, `npm run format:check`, and `npm run build` pass.
- Production internal links and assets resolve under `/chroma`, and the static output remains compatible with the existing GitHub Pages workflow.
- No uncaught runtime errors occur during the primary user journeys in supported browsers.

## 15. Verification checklist

Do not report a check as passed unless it was actually run. Fix discovered problems rather than only listing them.

- Run the existing type/Astro check, lint, formatting check, and production build.
- Add and run focused tests for colour calculations, filters, URL serialization, malformed storage, stop constraints, and relevant interactions.
- Inspect every route at mobile, tablet, desktop, and wide desktop widths, including intermediate resize states.
- Test on current Chromium and WebKit/Safari when available; record browser coverage accurately.
- Inspect screenshots or rendered pages for hierarchy, overflow, contrast, clipped values, and responsive behavior.
- Complete keyboard-only passes for search, filters, dialogs, comparison, gradient editing, and contrast entry.
- Verify accessible names, form errors, result announcements, focus restoration, and skip navigation with browser accessibility inspection or an automated accessibility checker.
- Test `prefers-reduced-motion`, light/dark appearance if supported, browser zoom, and text enlargement.
- Test malformed local storage, invalid URL parameters, empty results, invalid colour values, clipboard failure, and no catalogue data.
- Test production output with the `/chroma` base path and confirm routes, assets, and query-based comparison links resolve.
- Report automated checks separately from rendered-browser inspection. Do not claim physical-device, Safari, or live deployment validation unless performed.

## 16. Final response format

After implementation, report:

1. What was redesigned and why.
2. What was rebuilt or removed.
3. Files changed, grouped by purpose.
4. Components created or refactored.
5. Routes added, changed, or preserved.
6. Repository skills and references applied, with the relevant decisions.
7. Technical decisions for data source, state, persistence, routing, and deployment.
8. Commands and tests performed, with pass/fail results.
9. Browser and visual inspection performed, with the tested viewports.
10. Known limitations and remaining risks.

Do not describe an unperformed deployment or validation as complete.