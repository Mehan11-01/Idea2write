# Vocabulary photographic assets

Generated with the built-in image generation tool for Idea2Write. Original PNGs remain outside public/ in the workspace generated_images folder. Website copies are WebP, 720 × 480 pixels, quality 87; 12 files total 813,768 bytes.

## Coverage and integration

`src/vocabulary-pictures.js` declares `vocabPicture(word, q)`, returning `{src, alt, context}`. Load after `topic-art.js`. Exact concrete concepts return `context:false`. Other words return the mission's `topicArt(q)` with `context:true` and an alt explicitly beginning “Topic-context picture”. The interface must visibly label those as topic pictures. No glyph fallback.

Validated against all 36 missions from content.js and original-content.js: 396 vocabulary entries; 40 entries / 37 distinct terms receive direct photographic cues. In y4-weekend, 11 of 12 words have direct cues; the abstract period “weekend” uses labelled topic context. All resolved local paths exist. `book` is intentionally not directly mapped because the holiday mission uses it as a booking verb. Existing exact-topic photos cover picnic, party, camp, cat anatomy, funfair, museum/dinosaur, pancakes and astronaut/space. Broader abstract words are not mislabelled as literal photographs.

## Generation prompts

Common style specification: `Use case: photorealistic-natural. Asset type: English vocabulary learning photograph. Landscape 3:2 photograph, single clear activity, natural Malaysian home setting, realistic documentary photography. Clear subject readable at small thumbnail size. No text, no logos, no watermarks.` Initial calls additionally specified realistic professional lifestyle photography, authentic natural textures, fictional people, age-appropriate clothing and natural hands.

- **wake.webp:** A fictional Malaysian primary-school pupil, age 11, modest cotton pyjamas, sitting upright on bed and stretching arms as they wake in morning sunlight. Bed, bedside alarm clock and bright window visible. Clearly waking up.
- **wash.webp:** A fictional Malaysian pupil age 11 wearing a modest T-shirt, washing their face with water using both hands at a bathroom sink. Side view, face and hands clearly visible, tap and water splash. Fully clothed.
- **shower.webp:** An unoccupied clean modern home bathroom shower cubicle. A chrome shower head sprays running water. Folded towels on a shelf. Architectural interior photograph with no people.
- **lunch.webp:** A Malaysian family of two parents and two school-age children sitting around their home dining table eating lunch together. Rice, vegetables and noodles on plates, cutlery, water bottles. Daylight. Natural candid meal.
- **library.webp:** A fictional Malaysian school pupil age 11 reading an open book at a table inside a bright school library, bookshelves clearly visible behind. Natural daylight, clear books.
- **swimming.webp:** A fictional Malaysian school-age pupil swimming freestyle in a clear supervised public swimming pool, wearing a modest full-coverage long-sleeve swim top and swimming cap. Head and arms visible at water level, lifeguard distant.
- **shopping.webp:** A Malaysian parent and primary-school child shopping for vegetables at a local fresh-food market. Parent selecting tomatoes, child holding a shopping basket, stalls and produce clearly visible.
- **cook.webp:** A Malaysian father cooking noodles in a wok at a safe home kitchen stove. Visible noodles in wok, cooking spatula in hand, vegetables on counter. Natural documentary photograph.
- **homework.webp:** A fictional Malaysian primary-school pupil age 11 doing homework at a home desk, writing with a pencil in an exercise book, textbooks alongside. Side angle shows concentrated face, pencil and writing hand.
- **piano.webp:** A fictional Malaysian primary-school pupil age 11 practising an upright piano, seated correctly with both hands on keys, open sheet music on music stand. Home music corner, side angle shows keyboard and pupil.
- **tired.webp:** A fictional Malaysian primary-school pupil age 11 in modest cotton pyjamas yawning with one hand near their mouth while sitting on the edge of their bed at bedtime. Sleepy expression clearly visible, warm bedside lamp.
- **help.webp:** A Malaysian father patiently helping his primary-school child with homework at their home table, pointing at the exercise book while child writes. Both faces and helping gesture clear, caring family atmosphere.

## Checks

All 12 outputs visually inspected for the intended action/object and photo style, then compressed without creative changes. The shower scene contains no person. Source syntax check passed. Mapping resolution tested across every mission, including unknown custom word fallback and the ambiguous holiday term “book”. No avatar, app, CSS, build, account or database changes were made by this asset task.

