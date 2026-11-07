/* ===== Academy data: houses, portraits, rewards, practice (original content) ===== */
const HOUSES = [
  { id: "emberhart", name: "Emberhart", colour: "#7A1E2B", deep: "#4A0F18", metal: "#D9B15F", metalName: "gold", emblem: "flame",
    motto: "Warm hearts, bold stories.", desc: "The hearth house. Its common room sits beside the great fireplace." },
  { id: "mossvale", name: "Mossvale", colour: "#1E5B3E", deep: "#0E3322", metal: "#C9D1D6", metalName: "silver", emblem: "leaf",
    motto: "Grow one idea at a time.", desc: "The garden house. Its common room looks over the herb terraces." },
  { id: "skyreach", name: "Skyreach", colour: "#1F3F7A", deep: "#0F2148", metal: "#B9C8E2", metalName: "silver-blue", emblem: "star",
    motto: "Every word a little star.", desc: "The tower house. Its common room sits under the observatory dome." },
  { id: "honeystone", name: "Honeystone", colour: "#9A6A16", deep: "#4D3408", metal: "#2B2A28", metalName: "charcoal", emblem: "book",
    motto: "Together we write.", desc: "The library house. Its common room is lined with shelves of storybooks." }
];
const HOUSE = Object.fromEntries(HOUSES.map(h => [h.id, h]));

const PORTRAITS = [
  { id: "portrait1", alt: "A smiling pupil with long dark wavy hair wearing a dark school robe" },
  { id: "portrait2", alt: "A pupil with short curly brown hair and freckles wearing a robe with a green collar" },
  { id: "portrait3", alt: "A pupil with dark curly hair tied back, wearing a robe with a blue collar" },
  { id: "portrait4", alt: "A pupil with short black hair wearing a robe with a gold collar" },
  { id: "portrait5", alt: "A smiling pupil with long dark hair tied to the side, wearing a robe with a red collar" }
];

const COLLECTIBLES = [
  { id: "bronze-quill", name: "Bronze Quill", stars: 3, img: "bronzeQuill", desc: "A sturdy bronze quill for first drafts. Every writer begins somewhere." },
  { id: "starlight-vial", name: "Starlight Vial", stars: 9, img: "vial", desc: "A small glass vial holding tiny stars, one for each idea you have planned." },
  { id: "enchanted-quill", name: "Enchanted Quill", stars: 15, img: "enchantedQuill", desc: "A golden quill resting on a velvet cushion. It glows when you revise your work." },
  { id: "silver-trophy", name: "Silver Writing Trophy", stars: 30, img: "silverCup", desc: "A polished silver trophy for a writer who keeps finishing quests." },
  { id: "golden-cup", name: "Golden Storyteller Cup", stars: 60, img: "goldCup", desc: "The academy's golden cup for a dedicated storyteller." }
];

const LEVEL_TITLES = ["Novice Scribe", "Apprentice Writer", "Junior Wordsmith", "Wordsmith", "Story Keeper", "Senior Scribe", "Master Wordsmith", "Grand Storyteller"];
const levelTitle = (lv) => LEVEL_TITLES[Math.min(lv - 1, LEVEL_TITLES.length - 1)];

const ACHIEVEMENTS = [
  { id: "first-quest", name: "First quest completed", desc: "Complete your first writing quest.", test: (s) => s.quests >= 1 },
  { id: "three-days", name: "Three writing days in a row", desc: "Reach a 3-day writing streak.", test: (s) => s.longest >= 3 },
  { id: "five-quests", name: "Five quests completed", desc: "Complete five writing quests.", test: (s) => s.quests >= 5 },
  { id: "year-explorer", name: "Year explorer", desc: "Complete all six quests for one school year.", test: (s) => s.fullYear },
  { id: "week-streak", name: "Seven-day streak", desc: "Write on seven days in a row.", test: (s) => s.longest >= 7 },
  { id: "first-practice", name: "First practice", desc: "Complete one practice activity.", test: (s) => s.practice >= 1 },
  { id: "practice-ten", name: "Ten practice activities", desc: "Complete ten practice activities.", test: (s) => s.practice >= 10 }
];

/* Practice: grammar [question, options, correctIndex, explanation]; sentence: order sentence + choose item */
const PRACTICE = {
  "y4-daily-routine": { g: [["Every morning, I ___ my teeth.", ["brush", "brushes", "brushing"], 0, "With “I”, use the base verb: I brush."], ["Which sentence is written correctly?", ["At seven o'clock, I go to school.", "at seven o'clock, i go to school.", "At seven o'clock I go to school"], 0, "Start with a capital letter, write “I” as a capital, and end with a full stop."]],
    s: ["After that, I eat my breakfast.", ["Which sentence shows the right time order?", ["I wake up, and then I take a bath.", "I take a bath, and then I wake up.", "I wake up because I take a bath."], 0, "“And then” shows what happens next. You wake up before you bathe."]] },
  "y4-someone-special": { g: [["My grandmother ___ long, grey hair.", ["has", "have", "having"], 0, "For one person (he or she), use “has”."], ["She is very ___ and always helps me.", ["kind", "kindly", "kindness"], 0, "“Kind” is an adjective. It describes a person."]],
    s: ["She is special because she cares for me.", ["Choose the best way to join: “She likes cooking. She makes nasi lemak every Sunday.”", ["She likes cooking, so she makes nasi lemak every Sunday.", "She likes cooking, but she makes nasi lemak every Sunday.", "She likes cooking because nasi lemak every Sunday."], 0, "“So” shows a result of the first idea."]] },
  "y4-favourite-object": { g: [["My pencil case ___ two zips.", ["has", "have", "is"], 0, "One thing (it) uses “has”."], ["Which sentence puts the describing words in the right place?", ["It is a blue, rectangular pencil case.", "It is a pencil case blue rectangular.", "It is blue a rectangular pencil case."], 0, "Describing words usually come before the noun."]],
    s: ["I use it to keep my pencils.", ["Which sentence gives a complete reason?", ["I like it because it is useful.", "I like it because useful.", "Because it is useful I like it"], 0, "After “because”, write a full idea, and end with a full stop."]] },
  "y4-celebration": { g: [["The party will be ___ Saturday.", ["on", "in", "at"], 0, "Use “on” with days of the week."], ["The party starts ___ four o'clock.", ["at", "on", "in"], 0, "Use “at” with clock times."]],
    s: ["Please let me know if you can come.", ["Which invitation sentence is correct?", ["I would like to invite you to my birthday party.", "I would like invite you to my birthday party.", "I like to inviting you to my birthday party."], 0, "Use “would like to” + the base verb."]] },
  "y4-favourite-activity": { g: [["I ___ badminton every Saturday.", ["play", "plays", "playing"], 0, "With “I”, use the base verb."], ["I enjoy it ___ it is fun.", ["because", "but", "or"], 0, "“Because” gives a reason."]],
    s: ["I play badminton with my brother.", ["Which sentence shows a result?", ["Badminton is fun, so I play it every weekend.", "Badminton is fun, but I play it every weekend.", "Badminton is fun, or I play it every weekend."], 0, "“So” shows what happens because of the first idea."]] },
  "y4-animal": { g: [["A cat ___ fish.", ["eats", "eat", "eating"], 0, "For one animal, add -s to the verb."], ["Cats have soft ___.", ["paws", "pawes", "paw"], 0, "To make “paw” plural, just add -s."]],
    s: ["It has a long, fluffy tail.", ["Which sentence is correct?", ["I like cats because they are playful.", "I like cats because they is playful.", "I like cats because playful."], 0, "“They” goes with “are”."]] },
  "y5-about-me": { g: [["I am good ___ drawing.", ["at", "in", "on"], 0, "We say “good at” something."], ["I prefer football ___ badminton.", ["to", "than", "from"], 0, "We say “prefer A to B”."]],
    s: ["In my free time, I enjoy reading comics.", ["Which sentence is correct?", ["I am creative, and I enjoy making models.", "I am creative, and I enjoys making models.", "I creative and enjoy making models."], 0, "“I” goes with “am” and “enjoy”."]] },
  "y5-place-i-love": { g: [["The house is located ___ a small kampung.", ["in", "on", "at"], 0, "Use “in” for a village, town or city."], ["There ___ many coconut trees near the house.", ["are", "is", "be"], 0, "“Many trees” is plural, so use “are”."]],
    s: ["Next to the house, there is a small river.", ["Which sentence is correct?", ["The kampung is peaceful, and the breeze is cool.", "The kampung is peaceful, the breeze is cool and.", "Peaceful the kampung, and cool the breeze."], 0, "Use “and” between two complete ideas."]] },
  "y5-memorable-day": { g: [["Last Sunday, we ___ to the beach.", ["went", "go", "goes"], 0, "A recount is in the past. “Go” becomes “went”."], ["We ___ a big sandcastle.", ["built", "build", "builded"], 0, "“Build” becomes “built” in the past."]],
    s: ["Suddenly, a big wave washed it away.", ["Which pair is in the right order and tense?", ["First, we had breakfast. Then, we drove to the beach.", "Then, we had breakfast. First, we drove to the beach.", "First, we have breakfast. Then, we drive to the beach."], 0, "Recounts use time order and the past tense."]] },
  "y5-helpful-advice": { g: [["You ___ write your homework in a planner.", ["should", "shoulds", "should to"], 0, "Use “should” + the base verb, with no “to”."], ["Which is the most polite advice?", ["You could try a timetable.", "Make a timetable now!", "Timetable you must."], 0, "“You could try…” sounds kind and helpful."]],
    s: ["This will help you remember your homework.", ["Which sentence explains a purpose?", ["Tidy your desk every evening so that you can find your books.", "Tidy your desk every evening so that find books.", "So that you can find your books tidy."], 0, "“So that” + a full idea explains why."]] },
  "y5-meaningful-object": { g: [["My kite is made ___ bamboo and paper.", ["of", "with", "by"], 0, "“Made of” tells us the material."], ["It is the ___ thing I own.", ["most precious", "preciousest", "more precious"], 0, "Long adjectives use “most” for the top of the group."]],
    s: ["My grandfather gave it to me last year.", ["Which sentence uses “which” correctly?", ["I have a wau, which my grandfather made.", "I have a wau, who my grandfather made.", "I have a wau, which made my grandfather."], 0, "Use “which” for things and “who” for people."]] },
  "y5-special-person": { g: [["My uncle ___ me how to fix my bicycle last month.", ["taught", "teached", "teach"], 0, "“Teach” becomes “taught” in the past."], ["I have known him ___ I was a baby.", ["since", "for", "from"], 0, "Use “since” with a starting point in time."]],
    s: ["Together, we water the plants every evening.", ["Which sentence is correct?", ["He is not only funny but also kind.", "He is not only funny but kind also.", "He not only is funny but also kind is."], 0, "The pattern is “not only A but also B”."]] },
  "y6-holiday-plans": { g: [["Next week, we ___ visit Cameron Highlands.", ["are going to", "going to", "are go to"], 0, "For plans, use “am/is/are going to” + verb."], ["If it rains, we ___ visit the museum instead.", ["will", "would", "are"], 0, "If + present tense, then will + verb."]],
    s: ["Before the trip, I will pack my luggage.", ["Which sentence keeps the plan in the future?", ["We will stay at a homestay, and we will explore the tea plantations.", "We will stay at a homestay, and we explored the tea plantations.", "We stayed at a homestay, and we will explore the tea plantations."], 0, "Keep future plans in the future tense."]] },
  "y6-adventure": { g: [["Without warning, the torch ___.", ["went out", "goes out", "go out"], 0, "The story is told in the past tense."], ["Which sentence uses speech marks correctly?", ["“Look over there!” shouted Aina.", "“Look over there! shouted Aina.”", "Look over there! “shouted Aina.”"], 0, "Speech marks go around the spoken words only."]],
    s: ["Eventually, they found the way out of the cave.", ["Which sentence is correct?", ["Although they were scared, they kept walking.", "Although they were scared, but they kept walking.", "They were scared although, they kept walking."], 0, "Do not use “although” and “but” together."]] },
  "y6-person-admire": { g: [["My teacher is very ___; she never gives up.", ["determined", "determination", "determine"], 0, "“Determined” is the adjective that describes her."], ["She always ___ the truth.", ["tells", "tell", "telling"], 0, "For one person (she), add -s."]],
    s: ["This shows that she cares about her pupils.", ["Which sentence gives a trait with an example?", ["She is generous. For example, she shares her books with us.", "She is generous. For example, she share her books with us.", "She is generous for example she shares her books."], 0, "Give the trait, then an action as the example."]] },
  "y6-school-event": { g: [["Our school ___ its Sports Day last Friday.", ["held", "holds", "hold"], 0, "“Hold” becomes “held” in the past."], ["The event began ___ an opening ceremony.", ["with", "by", "from"], 0, "We say “began with”."]],
    s: ["The highlight of the day was the relay race.", ["Which pair is in a sensible order?", ["Before the event, we rehearsed our march. Later, we cheered for our team.", "Later, we rehearsed our march. Before the event, we cheered for our team.", "Before the event, we rehearse our march. Later, we cheer for our team."], 0, "Use time words in order and keep the past tense."]] },
  "y6-getting-to-know-us": { g: [["Both of us ___ football.", ["enjoy", "enjoys", "enjoying"], 0, "“Both of us” is plural, so use “enjoy”."], ["I like drawing, ___ my friend prefers sports.", ["whereas", "because", "so"], 0, "“Whereas” shows a difference between two people."]],
    s: ["Unlike me, my friend is very good at swimming.", ["Which sentence is correct?", ["We are similar because we both love reading.", "We are similar because we both loves reading.", "We similar because both love reading."], 0, "“We” goes with “are” and “love”."]] },
  "y6-class-project": { g: [["Aiman will be responsible ___ collecting cardboard.", ["for", "of", "to"], 0, "We say “responsible for”."], ["We need ___ boxes for the reading corner.", ["some", "a", "an"], 0, "Use “some” with plural nouns."]],
    s: ["We will decorate the corner so that it looks inviting.", ["Which steps are in a sensible order?", ["First, we will collect old books. Next, we will arrange them on the shelf.", "Next, we will collect old books. First, we will arrange them on the shelf.", "First, we collected old books. Next, we will arranges them on the shelf."], 0, "Steps follow time order, using “will” for plans."]] }
};

/* Deterministic shuffle so answer positions vary but stay stable between visits */
function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
function shuffle(arr, seed) { const r = seeded(seed), a = arr.map((v, i) => [v, i]); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const PRACTICE_CATS = [
  { id: "vocab", name: "Vocabulary practice", icon: "book" },
  { id: "grammar", name: "Grammar practice", icon: "quill" },
  { id: "sentence", name: "Sentence structure practice", icon: "stack" }
];
/* Build one activity: a list of questions {type:'mc'|'order', prompt, options, answer, why} */
function practiceActivity(topicId, cat) {
  const t = TOPIC[topicId], p = PRACTICE[topicId];
  if (cat === "vocab") {
    return t.vocab.slice(0, 4).map(([w, m], i) => {
      const others = t.vocab.filter(v => v[0] !== w).map(v => v[0]);
      const pick = shuffle(others, topicId + w).slice(0, 2).map(x => x[0]);
      return { type: "mc", prompt: `Which word means “${m}”?`, options: [w, ...pick], answer: 0, why: `“${w}” means ${m}.` };
    });
  }
  if (cat === "grammar") return p.g.map(([q, o, a, why]) => ({ type: "mc", prompt: q, options: o, answer: a, why }));
  const [order, [q, o, a, why]] = p.s;
  return [{ type: "order", prompt: "Put the words in the right order to make a sentence.", sentence: order, why: "A sentence starts with a capital letter, keeps words in a sensible order and ends with punctuation." },
    { type: "mc", prompt: q, options: o, answer: a, why }];
}
