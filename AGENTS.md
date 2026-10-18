# Project rules
- Keep the personal website as a single editorial narrative with in-page navigation; its sections tell one continuous identity story.
- Keep the contact form isolated with a shared validation schema and explicit hosted-provider selection; the default Cloud service stays intact while external deployments can avoid database dependencies.
- Define all visual colors and effects with semantic global CSS tokens; the monochrome design must remain consistently themeable.
- Use native intersection and scroll effects with reduced-motion support; motion must not prevent access to content or interactions.
- Use TanStack hash Links for the single narrative page and Nitro platform presets for external hosting; SPA fallback rewrites would bypass the server-rendered application.
- Resolve portraits through asset pointers by default and a configurable portrait folder for external hosting; Lovable media paths are not hosted by other platforms.
- Register Netlify Forms in a static detection file and post to that file; SSR HTML alone is not scanned by Netlify form detection.
- Keep visitor FAQs in an isolated, accessible disclosure component within the contact section; answers must use verified public biography and contact options, never inferred services or response promises.
