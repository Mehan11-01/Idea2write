# Realistic topic photo provenance

All 36 writing missions now resolve to photographic topic artwork through `src/realistic-topic-pictures.js`, loaded after `topic-art.js`. Existing exact-topic JPG photographs remain unchanged. All previous SVG topic mappings are overridden, including unknown/custom mission fallback. No source SVG files were deleted.

## Assets

17 WebP assets in `public/assets/topics/realistic/`, total 2,259,706 bytes. Fifteen scenes were generated with the built-in image-generation tool and optimized to 900 × 600 pixels at WebP quality 87. `routine.webp` reuses `assets/vocabulary/wake.webp`; `object.webp` reuses `assets/vocabulary/homework.webp`, each 720 × 480. Only compression/resizing was performed; original PNGs remain outside public/.

## Prompt specification

Common specification for all generated scenes: `Use case: photorealistic-natural. Asset type: English writing mission topic photograph for Year 4–6 Malaysian pupils. Style: realistic professional documentary lifestyle photograph, authentic Malaysian setting, natural textures and light, no illustration or cartoon. Landscape 3:2 composition, clear central subjects with useful setting, readable at thumbnail size. Fictional people, age-appropriate modest clothing. No text, no logo, no watermark.`

### someone.webp

Primary request: A Malaysian grandmother wearing a lilac tudung and glasses sitting in a leafy home garden beside her smiling primary-school grandchild. Warm relationship, flowers and tree.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-fbe68fa5-257f-4232-879a-c900de8bd48a.png

### celebration.webp

Primary request: A Malaysian family welcoming guests to a festive open house at their home. Modest traditional clothing, friendly greetings, table with kuih and food in background. Clear welcoming interaction.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-0bf0c29c-c248-41f8-a5d1-ad4fc6cb3eea.png

### activity.webp

Primary request: Two Malaysian primary-school pupils playing badminton across a net on a school court. One wears a sports tudung. Rackets and shuttlecock clearly visible, modest sports uniforms.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-93450c9a-adfd-4097-96b6-660745dea237.png

### aboutme.webp

Primary request: A Malaysian primary-school pupil sitting at a desk with favourite books, a sketchbook and a football beside the chair, showing a variety of personal interests. Cheerful natural portrait.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-cc227c67-f9ed-4b0f-a375-985a6638484e.png

### place.webp

Primary request: A traditional Malaysian wooden kampung house on stilts among coconut trees beside lush green paddy fields. Beautiful everyday rural landscape, blue sky.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-d415d9fd-09c3-43d9-8e81-5b0bbbce7fc8.png

### memorable.webp

Primary request: A Malaysian family enjoying a sunny beach day. Two school-age children building a sandcastle beside their parents, waves and palm trees in background, modest casual clothing.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-75103ff2-7293-4c71-b59e-e349e015fbc5.png

### advice.webp

Primary request: A Malaysian primary-school pupil sitting at a desk looking mildly overwhelmed by a pile of homework books and loose papers. Thoughtful worried face, ordinary home setting, no severe distress.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-48986df1-7f0d-4c21-84bb-7409d9c144d1.png

### wau.webp

Primary request: A Malaysian primary-school child flying a colourful traditional wau bulan kite in a grassy field. The distinctive crescent-shaped decorated kite is visible in sky and string held by child.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-fd604114-7769-4d49-927b-52cf5b349b40.png

### person.webp

Primary request: A Malaysian uncle wearing a songkok watering plants with his primary-school niece or nephew in a home garden. Both hold or guide a watering can, potted plants visible, caring family moment.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-fb1424c6-a82e-42b1-8f21-7cb353b024d9.png

### holiday.webp

Primary request: A Malaysian family on holiday at Cameron Highlands, standing beside travel luggage at a viewpoint with rolling green tea plantation hills behind. Modest casual clothes, cool misty daylight.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-af27fd9f-a354-42fd-afb6-72ef5d17e69b.png

### adventure.webp

Primary request: Two Malaysian school-age pupils on a safe guided cave visit near the entrance, each holding a torch, with a responsible adult guide visible behind. Torchlight reveals limestone rocks, curious expressions.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-f16193eb-8f6f-4e2b-905c-a8e3cfd0f945.png

### admire.webp

Primary request: A Malaysian teacher in a blue tudung patiently helping a primary-school pupil at a classroom desk. Teacher points at an exercise book, supportive smiles, bright school classroom.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-ffe5082f-a1f8-45aa-ba3d-194b59affdbb.png

### event.webp

Primary request: Malaysian primary-school sports day. Pupils running on a school track while classmates cheer behind a boundary line with colourful flags. Modest sports uniforms, lively realistic scene.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-ee6f2344-aea1-49ee-861f-48acd6a9ea5e.png

### getting.webp

Primary request: Two Malaysian primary-school friends chatting together on a school bench with schoolbags, one holds a sketchbook and the other has a football at their feet. Friendly attentive expressions.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-a2be2666-b60c-40a8-b711-57d65d97c11f.png

### project.webp

Primary request: A Malaysian classroom recycling and reading-corner project. Two primary-school pupils sorting clean paper, plastic bottles and cans into three separate bins near bookshelves and cushions. Teacher supervising in background.

Original generated asset: /workspace/scratch/14ebff8bbc1d/generated_images/exec-a9636c7b-2301-4aaa-8582-31b5c70efc75.png

## Validation

All 15 generated outputs were visually inspected against their intended scene. Helper syntax check passed. Runtime resolution was tested across all 36 missions and 396 vocabulary entries, plus unknown/custom topic fallback: zero SVG results and zero missing image paths. The helper explicitly maps all 36 mission IDs and replaces residual SVG entries defensively. Another bounded asset task supplies more specific town/career images after this helper. No avatar, authentication, submission, database, CSS or app functionality was changed in this task.

