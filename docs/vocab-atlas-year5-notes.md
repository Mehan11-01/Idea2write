# Year 5 vocabulary photo atlases

Created using the built-in image generation tool, one atlas per request. Each atlas is a single photographic contact sheet with three equal columns and four equal rows. Each cell uses a new distinct photographic composition illustrating its corresponding word; abstract meanings use a contextual situation. The first 10 cells of the six legacy missions are used; the final two are unused spare photographs.

Prompt template: “Use case: photorealistic-natural. Asset type: ONE photographic vocabulary atlas, exact regular contact sheet of 3 equal columns and 4 equal rows, 12 perfectly rectangular photo cells with no gaps, gutters, borders, text, labels, numbers, logos or watermark. Portrait ratio 3:4. Each cell is a different natural realistic photograph for a primary ESL vocabulary lesson, with a clear recognisable action, object or contextual situation. Malaysian families and pupils where people appear. Real camera texture, natural light, genuine photographic style, never drawing, cartoon or icon. Subjects centred and contained within their own cells. Read left to right, top row to bottom row, following the supplied numbered scene list. Distinct environments, people and compositions; no repeated photo.”

The scene lists in `vocab-atlas-year5-scenes.json` record the per-cell prompt briefs and provide accessible image descriptions. `vocab-atlas-year5-manifest.json` records source files, output paths, dimensions and file sizes.

All 12 finished images were visually inspected against the requested original vocabulary order. All use an exact 1086×1448 3×4 grid (362px square cells). Saved as RGB WebP at quality 88 under `firebase-academy/public/assets/vocabulary-atlases/`. Total size: 4,346,748 bytes. All pictures are newly generated and differ from the existing topic covers.

The retained generation cell became stale during workspace pruning, but all pending PNG results had completed and were recovered from the generated_images directory; no calls were repeated.
