/* Photographic vocabulary cues. Exact concepts only; abstract/custom terms use
   explicitly marked topic context rather than pretending to depict the word. */
const VOCABULARY_PICTURES = Object.create(null);
function registerVocabPicture(words, file, alt) {
  for (const word of words.split('|')) VOCABULARY_PICTURES[word] = {src:file,alt,context:false};
}
const VOCAB_PHOTO_BASE = 'assets/vocabulary/';
registerVocabPicture('wake|wake up|waking up',VOCAB_PHOTO_BASE+'wake.webp','A pupil sits up in bed and stretches while waking up in the morning.');
registerVocabPicture('wash|wash face|wash my face',VOCAB_PHOTO_BASE+'wash.webp','A fully clothed pupil washes their face with water at a bathroom sink.');
registerVocabPicture('shower|shower head',VOCAB_PHOTO_BASE+'shower.webp','Water sprays from a shower head in an empty bathroom.');
registerVocabPicture('lunch|meal|eat|eating',VOCAB_PHOTO_BASE+'lunch.webp','A family eats lunch together around their dining table.');
registerVocabPicture('library|read|reading|books',VOCAB_PHOTO_BASE+'library.webp','A pupil reads an open book at a table surrounded by library bookshelves.');
registerVocabPicture('swimming|swim',VOCAB_PHOTO_BASE+'swimming.webp','A pupil swims in a supervised swimming pool.');
registerVocabPicture('shopping|market|stall',VOCAB_PHOTO_BASE+'shopping.webp','A parent and child shop for vegetables at a fresh-food market stall.');
registerVocabPicture('cook|cooking|noodles',VOCAB_PHOTO_BASE+'cook.webp','A father cooks noodles in a wok in his home kitchen.');
registerVocabPicture('homework|study|studying',VOCAB_PHOTO_BASE+'homework.webp','A pupil writes in an exercise book while doing homework at a desk.');
registerVocabPicture('practise|practice|practise piano|piano|play the piano',VOCAB_PHOTO_BASE+'piano.webp','A pupil practises an upright piano with both hands on the keys.');
registerVocabPicture('tired|sleepy|yawn|yawning',VOCAB_PHOTO_BASE+'tired.webp','A tired pupil in pyjamas yawns while sitting on the edge of their bed.');
registerVocabPicture('help|helping|family',VOCAB_PHOTO_BASE+'help.webp','A father helps his child with homework by pointing at the exercise book.');
registerVocabPicture('picnic','assets/topics/picnic.jpg','A picnic blanket with food laid out outdoors.');
registerVocabPicture('party|birthday|cake','assets/topics/birthday.jpg','A birthday cake with glowing candles.');
registerVocabPicture('camp|tent','assets/topics/camping.jpg','A yellow camping tent beside a forest stream.');
registerVocabPicture('cat|fur|paws|tail|stripes','assets/topics/cat.jpg','An orange striped cat with fur, paws and a tail sitting in the grass.');
registerVocabPicture('funfair|ferris wheel','assets/topics/funfair.jpg','A large Ferris wheel at a funfair.');
registerVocabPicture('museum|dinosaur','assets/topics/museum.jpg','A dinosaur skeleton displayed inside a museum hall.');
registerVocabPicture('pancake|pancakes','assets/topics/pancakes.jpg','Syrup is poured over a stack of pancakes with fruit.');
registerVocabPicture('robot','assets/topics/robot.jpg','A white robot with a screen on its chest.');
registerVocabPicture('astronaut|space','assets/topics/space.jpg','An astronaut in a spacesuit floats above Earth in space.');
registerVocabPicture('plate|spoon|bottle',VOCAB_PHOTO_BASE+'lunch.webp','Plates of food, spoons and drinking bottles on a family lunch table.');
registerVocabPicture('pencil case|uniform',VOCAB_PHOTO_BASE+'homework.webp','A pupil in school uniform writes beside a pink pencil case.');
registerVocabPicture('blanket',VOCAB_PHOTO_BASE+'wake.webp','A patterned blanket on a pupil’s bed.');
function vocabPicture(word,q) {
  const key=String(word||'').toLowerCase().trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const picture=VOCABULARY_PICTURES[key];
  if(picture) return {...picture};
  const topic={id:q?.id||'',title:q?.title||'Writing topic'};
  const art=topicArt(topic);
  return {src:art.src,alt:'Topic-context picture: '+art.alt,context:true};
}
