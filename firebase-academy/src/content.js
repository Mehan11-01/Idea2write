/* ================= DSKP-aligned content =================
   Sources: DSKP KSSR (Semakan 2017) Bahasa Inggeris SK Tahun 4 (BPK, 2018), Tahun 5 (BPK, 2020), Tahun 6 (BPK, 2022).
   Themes, writing learning standards (4.2.x, 4.3.x), grammar lists, CEFR targets and text lengths come from those documents.
   Every vocab word below appears in that year's DSKP core word list. */
/* Houses are team identities only; any pupil can join any house. */
const HOUSES={
  kenyalang:{id:"kenyalang",name:"Kenyalang",full:"House Kenyalang",beast:"Hornbill",motto:"Fly high, think far",col:"#9e2a35",col2:"#f0c05a",dark:"#3d0d14",traits:"Courage · Leadership · Unity"},
  harimau:{id:"harimau",name:"Harimau",full:"House Harimau",beast:"Malayan tiger",motto:"Brave words, bold stories",col:"#2747a3",col2:"#f0a040",dark:"#0e1a45",traits:"Strength · Determination · Perseverance"},
  penyu:{id:"penyu",name:"Penyu",full:"House Penyu",beast:"Sea turtle",motto:"Steady steps, deep wisdom",col:"#1f7a62",col2:"#cfe9c4",dark:"#0b2e25",traits:"Wisdom · Calmness · Resilience"}
};
const HOUSE_IDS=["kenyalang","harimau","penyu"];
/* School year decides the curriculum level (DSKP KSSR Semakan 2017). */
const YEARS={
  4:{cefr:"A1 High",len:50,paras:"one paragraph",pupil:"Write one paragraph (about 50 words)."},
  5:{cefr:"A2 Low",len:70,paras:"one or two paragraphs",pupil:"Write one or two paragraphs (about 70 words)."},
  6:{cefr:"A2 Mid",len:100,paras:"two paragraphs",pupil:"Write two paragraphs (about 100 words)."}
};
const THEMES={self:"World of Self, Family and Friends",stories:"World of Stories",know:"World of Knowledge"};

const QUESTS={
/* ---------------- YEAR 4 ---------------- */
4:[
 {id:"y4-weekend",title:"My Weekend",theme:"self",std:"4.2.3 Describe basic everyday routines",grammar:"Present simple and time words",type:"Diary entry",glyph:"time",
  task:"Write a paragraph about what you do on a weekend.",
  qs:[
   {w:"WHEN",q:"do you wake up on Saturday?",frame:"On Saturday, I wake up at…",hint:"Early or late? What time is it?",cat:"morning"},
   {w:"WHAT",q:"do you do in the morning?",frame:"In the morning, I…",hint:"Do you wash, eat breakfast or help at home?",cat:"morning"},
   {w:"WHERE",q:"do you go?",frame:"After that, I go to…",hint:"The library? The market? A swimming pool?",cat:"places"},
   {w:"WHO",q:"do you spend time with?",frame:"I spend time with…",hint:"Your family? Your cousins? Your friends?",cat:"people"},
   {w:"HOW",q:"do you finish your day?",frame:"In the evening, I…",hint:"Do you do homework, read or watch a video?",cat:"evening"},
   {w:"WHY",q:"do you like or not like your weekend?",frame:"I like my weekend because…",hint:"Give a reason with because.",cat:"feel"}],
  cats:[{id:"morning",name:"Morning",hint:"What happens first?"},{id:"places",name:"Places",hint:"Where do you go?"},{id:"people",name:"People",hint:"Who is with you?"},{id:"evening",name:"Evening",hint:"How does the day end?"},{id:"feel",name:"Opinion",hint:"Do you like it? Why?"}],
  vocab:[["wake","I wake up at seven o’clock.","time"],["wash","I wash my face.","act"],["shower","I have a quick shower.","act"],["lunch","We eat lunch together.","food"],["weekend","I love the weekend!","time"],["library","I read books at the library.","place"],["swimming","I go swimming with my sister.","act"],["shopping","We go shopping at the market.","place"],["cook","My father cooks noodles.","food"],["homework","I finish my homework.","thing"],["practise","I practise the piano.","act"],["tired","I am tired at night.","feel"]],
  starters:["On Saturday, I wake up at…","In the morning, I…","After that, I…","In the evening, I…","I like my weekend because…"],
  focus:[{label:"Use time words (in the morning, after that, then)",re:"\\b(in the morning|in the afternoon|in the evening|after that|then|before|after|at night|o['’]clock)\\b"}]},
 {id:"y4-picnic",title:"My Dream Picnic",theme:"self",std:"4.2.1 Explain and give reasons for simple opinions",grammar:"Be going to; because",type:"Description",glyph:"food",
  task:"Write a paragraph about your dream picnic. Say why you would enjoy it.",
  qs:[
   {w:"WHERE",q:"would you have your picnic?",frame:"I am going to have my picnic at…",hint:"A park? A beach? Next to a river?",cat:"place"},
   {w:"WHO",q:"would you invite?",frame:"I am going to invite…",hint:"Your family? Your best friends?",cat:"people"},
   {w:"WHAT",q:"food would you bring?",frame:"We are going to bring…",hint:"Noodles, salad, a milkshake?",cat:"food"},
   {w:"WHAT",q:"would you do there?",frame:"We are going to…",hint:"Play, swim, take photos?",cat:"act"},
   {w:"HOW",q:"would the weather be?",frame:"The weather is going to be…",hint:"Sunny? Windy? A blue sky?",cat:"place"},
   {w:"WHY",q:"would you enjoy it?",frame:"I would enjoy it because…",hint:"Give a reason with because.",cat:"feel"}],
  cats:[{id:"place",name:"Place & Weather",hint:"Where? What is the sky like?"},{id:"people",name:"People",hint:"Who is coming?"},{id:"food",name:"Food & Drink",hint:"What will you eat?"},{id:"act",name:"Activities",hint:"What will you do?"},{id:"feel",name:"Opinion",hint:"Why is it special?"}],
  vocab:[["picnic","Let’s have a picnic!","food"],["park","The park has big trees.","nature"],["river","We sit next to the river.","nature"],["bring","I will bring a bottle of water.","act"],["noodles","My aunt cooks fried noodles.","food"],["salad","We share a fresh salad.","food"],["milkshake","I drink a cold milkshake.","food"],["plate","Put the food on a plate.","thing"],["laugh","We laugh at funny jokes.","feel"],["sky","The sky is blue.","nature"],["weather","The weather is sunny.","nature"],["bottle","I have a bottle of juice.","thing"]],
  starters:["I am going to have my picnic at…","I am going to invite…","We are going to bring…","We are going to…","I would enjoy it because…"],
  focus:[{label:"Give a reason with because",re:"\\bbecause\\b"}]},
 {id:"y4-party",title:"A Party Invitation",theme:"self",std:"4.2.2 Make and respond to simple offers and invitations",grammar:"Would you like…? / Let’s…",type:"Invitation",glyph:"letter",
  task:"Write an invitation to your class party.",
  qs:[
   {w:"WHO",q:"are you inviting?",frame:"Dear…",hint:"Your class? A friend? Your teacher?",cat:"invite"},
   {w:"WHAT",q:"is the party for?",frame:"Would you like to come to my…",hint:"A birthday? The end of the school year?",cat:"invite"},
   {w:"WHEN",q:"is the party?",frame:"The party is on… at…",hint:"Which day? What time (o’clock)?",cat:"when"},
   {w:"WHERE",q:"is the party?",frame:"The address is…",hint:"Your house? The school hall?",cat:"when"},
   {w:"WHAT",q:"will everyone do?",frame:"We are going to…",hint:"Games? Music? A magic show?",cat:"fun"},
   {w:"HOW",q:"should guests reply?",frame:"Please tell me by…",hint:"Should they send a message or tell you at school?",cat:"reply"}],
  cats:[{id:"invite",name:"The Invitation",hint:"Who and what for?"},{id:"when",name:"Time & Place",hint:"When and where?"},{id:"fun",name:"Fun Things",hint:"What will you do?"},{id:"food",name:"Food",hint:"What will you eat?"},{id:"reply",name:"Reply",hint:"How do they answer?"}],
  vocab:[["party","Come to my party!","act"],["invite","I want to invite you.","letter"],["present","You don’t need to bring a present.","thing"],["address","Here is my address.","place"],["o’clock","The party starts at four o’clock.","time"],["surprised","My mother will be surprised.","feel"],["sweet","There will be sweet cakes.","food"],["cup","Bring your own cup.","thing"],["idea","I have a great idea!","feel"],["everyone","Everyone is welcome.","person"],["wait","I can’t wait to see you.","feel"],["brilliant","It will be brilliant!","feel"]],
  starters:["Dear…,","Would you like to come to my…?","The party is on… at… o’clock.","We are going to…","Please tell me by…"],
  focus:[{label:"Invite politely (Would you like…?, Please come…, Let’s…)",re:"\\b(would you like|please come|can you come|let['’]s|i would like to invite|you are invited)\\b"}]},
 {id:"y4-hero",title:"My Hero at Home",theme:"self",std:"4.2.4 Describe people and objects using suitable statements",grammar:"Possessive ’s; comparatives",type:"Description",glyph:"person",
  task:"Describe a person in your family who you admire.",
  qs:[
   {w:"WHO",q:"is your hero at home?",frame:"My hero is my…",hint:"Your grandparent? Your aunt or uncle?",cat:"who"},
   {w:"WHAT",q:"does this person look like?",frame:"He/She is… and has…",hint:"Tall? Curly hair? A beard?",cat:"looks"},
   {w:"WHAT",q:"is this person like?",frame:"He/She is very…",hint:"Kind? Brave? Careful?",cat:"like"},
   {w:"WHAT",q:"does this person do?",frame:"Every day, he/she…",hint:"Cook? Work? Help people?",cat:"does"},
   {w:"HOW",q:"does this person help you?",frame:"He/She helps me…",hint:"With homework? When you are sad?",cat:"does"},
   {w:"WHY",q:"do you admire this person?",frame:"I admire my… because…",hint:"Give a reason with because.",cat:"why"}],
  cats:[{id:"who",name:"Who",hint:"Who is it?"},{id:"looks",name:"Looks",hint:"What do they look like?"},{id:"like",name:"Character",hint:"What are they like?"},{id:"does",name:"Actions",hint:"What do they do?"},{id:"why",name:"Why I Admire",hint:"Give a reason."}],
  vocab:[["aunt","My aunt is a nurse.","person"],["uncle","My uncle drives a bus.","person"],["grandparent","My grandparent tells stories.","person"],["tall","He is taller than my father.","person"],["curly","She has long curly hair.","person"],["beard","My grandfather has a white beard.","person"],["moustache","My uncle has a moustache.","person"],["kind","She is kind to everyone.","feel"],["brave","He is very brave.","feel"],["careful","She drives carefully.","act"],["help","He helps me with my homework.","act"],["laugh","She makes me laugh.","feel"]],
  starters:["My hero is my…","He/She is… and has…","He/She is very…","Every day, he/she…","I admire my… because…"],
  focus:[{label:"Use ’s or a comparing word (taller than, the kindest)",re:"\\b\\w+['’]s\\b|\\b\\w+er than\\b|\\bmore \\w+ than\\b|\\bthe \\w+est\\b"}]},
 {id:"y4-funfair",title:"A Day at the Funfair",theme:"stories",std:"4.2.1 Explain and give reasons for simple opinions",grammar:"Past simple; What was it like?",type:"Recount",glyph:"act",
  task:"Write about a trip to a funfair. Was it fun? Why?",
  qs:[
   {w:"WHEN",q:"did you go to the funfair?",frame:"Last Saturday, I went to…",hint:"Last weekend? During the holiday?",cat:"start"},
   {w:"HOW",q:"did you get there?",frame:"We went by…",hint:"By bus? By car? On foot?",cat:"start"},
   {w:"WHO",q:"went with you?",frame:"I went with…",hint:"Your family? Your cousins?",cat:"start"},
   {w:"WHAT",q:"did you ride or see?",frame:"First, we rode…",hint:"A huge wheel? A fast ride? Clowns?",cat:"did"},
   {w:"WHAT",q:"was it like?",frame:"It was…",hint:"Exciting? Loud? A bit frightening?",cat:"feel"},
   {w:"WHY",q:"did you like or not like it?",frame:"I liked it because…",hint:"Give a reason with because.",cat:"opinion"}],
  cats:[{id:"start",name:"Getting There",hint:"When, how, who?"},{id:"did",name:"What We Did",hint:"Rides and games"},{id:"feel",name:"Feelings",hint:"How did you feel?"},{id:"opinion",name:"Opinion",hint:"Good or bad? Why?"},{id:"end",name:"The End",hint:"How did the day end?"}],
  vocab:[["funfair","The funfair was full of lights.","place"],["ticket","I bought a ticket.","thing"],["bus","We went by bus.","travel"],["ride","I went on a fast ride.","act"],["exciting","The ride was exciting!","feel"],["frightened","I was a little frightened.","feel"],["huge","We saw a huge wheel.","thing"],["loudly","Everyone shouted loudly.","act"],["afraid","My brother was afraid.","feel"],["quickly","The ride moved quickly.","act"],["trip","It was a great trip.","travel"],["tired","We were tired at the end.","feel"]],
  starters:["Last Saturday, I went to…","We went by…","First, we…","It was… because…","At the end of the day, I felt…"],
  focus:[{label:"Write about the past (went, played, was)",re:"\\b(went|saw|was|were|had|rode|got|felt|bought|took|came|ate|\\w+ed)\\b"}]},
 {id:"y4-doctor",title:"What’s the Matter?",theme:"know",std:"4.2.3 Describe basic everyday routines",grammar:"Adverbs of manner (-ly); could",type:"Short report",glyph:"health",
  task:"Write about a time you felt ill and how you got better.",
  qs:[
   {w:"WHAT",q:"was the matter?",frame:"One day, I had a…",hint:"A headache? A cough? A temperature?",cat:"problem"},
   {w:"WHERE",q:"did you go?",frame:"My mother took me to…",hint:"The doctor? The hospital? The dentist?",cat:"help"},
   {w:"WHO",q:"helped you?",frame:"The… helped me.",hint:"A doctor? A nurse? Your family?",cat:"help"},
   {w:"WHAT",q:"could you not do?",frame:"I could not…",hint:"Go to school? Play football?",cat:"problem"},
   {w:"HOW",q:"did you get better?",frame:"I drank water and rested…",hint:"Use a -ly word: slowly, quietly, carefully.",cat:"better"},
   {w:"WHY",q:"is it important to look after yourself?",frame:"It is important because…",hint:"Give a reason with because.",cat:"lesson"}],
  cats:[{id:"problem",name:"The Problem",hint:"What was wrong?"},{id:"help",name:"Help",hint:"Who helped? Where?"},{id:"better",name:"Getting Better",hint:"What did you do?"},{id:"feel",name:"Feelings",hint:"How did you feel?"},{id:"lesson",name:"What I Learnt",hint:"Why does it matter?"}],
  vocab:[["headache","I had a bad headache.","health"],["cough","He has a cough.","health"],["temperature","My temperature was high.","health"],["doctor","The doctor was kind.","person"],["nurse","The nurse helped me.","person"],["hospital","We went to the hospital.","place"],["earache","I had an earache.","health"],["ill","I felt ill yesterday.","health"],["sick","I was sick for two days.","health"],["water","Drink a lot of water.","food"],["better","Now I feel better.","feel"],["slowly","I walked slowly.","act"]],
  starters:["One day, I had a…","My mother took me to…","I could not…","I rested quietly and…","It is important to… because…"],
  focus:[{label:"Use a -ly word (slowly, quietly, carefully)",re:"\\b(slowly|quickly|quietly|loudly|carefully|badly|well|happily|sadly)\\b"}]}
],
/* ---------------- YEAR 5 ---------------- */
5:[
 {id:"y5-me",title:"All About Me",theme:"self",std:"4.2.1 Give detailed information about themselves",grammar:"Adverbs of frequency",type:"Profile / blog",glyph:"person",
  task:"Write a short blog post that tells readers all about you.",
  qs:[
   {w:"WHO",q:"are you?",frame:"My name is… and my surname is…",hint:"Your name, age and where you live.",cat:"me"},
   {w:"WHO",q:"is in your family or neighbourhood?",frame:"I live with…",hint:"Family, a friendly neighbour, a pet?",cat:"me"},
   {w:"WHAT",q:"do you usually do after school?",frame:"After school, I usually…",hint:"Use always, usually, often, sometimes or never.",cat:"habits"},
   {w:"WHAT",q:"are you interested in?",frame:"I am interested in…",hint:"Chess, music, volleyball, the violin?",cat:"likes"},
   {w:"WHERE",q:"do you do your hobby?",frame:"I sometimes practise at…",hint:"At home, at school, at a club?",cat:"habits"},
   {w:"WHY",q:"do you enjoy it?",frame:"I enjoy it because…",hint:"What makes it fun or special?",cat:"why"}],
  cats:[{id:"me",name:"About Me",hint:"Name, home, family"},{id:"habits",name:"Habits",hint:"How often?"},{id:"likes",name:"Interests",hint:"What do you like?"},{id:"goal",name:"My Goal",hint:"What do you want to improve?"},{id:"why",name:"Reasons",hint:"Why?"}],
  vocab:[["surname","My surname is Tan.","person"],["myself","Let me tell you about myself.","person"],["neighbour","My neighbour is very friendly.","person"],["usually","I usually walk to school.","time"],["chess","I play chess on Fridays.","act"],["violin","I am learning the violin.","thing"],["volleyball","I sometimes play volleyball.","act"],["team","I am in the school team.","person"],["member","I am a member of the art club.","person"],["interested","I am interested in music.","feel"],["competition","I want to win a competition.","act"],["improve","I want to improve my drawing.","act"]],
  starters:["My name is…","After school, I usually…","I am interested in…","I sometimes… but I never…","I enjoy it because…"],
  focus:[{label:"Say how often (always, usually, often, sometimes, never)",re:"\\b(always|usually|often|sometimes|never)\\b"}]},
 {id:"y5-camp",title:"My Camping Adventure",theme:"stories",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Sequencing: First, Next, After that",type:"Recount",glyph:"nature",
  task:"Write about a camping trip, real or imagined. Tell the events in order.",
  qs:[
   {w:"WHERE",q:"did you camp?",frame:"Last holiday, we camped near…",hint:"A forest? A beach? A hill?",cat:"start"},
   {w:"WHO",q:"was with you?",frame:"I went with…",hint:"Your scouts group? Your family?",cat:"start"},
   {w:"WHAT",q:"did you do first?",frame:"First, we…",hint:"Put up the tent? Collect wood?",cat:"middle"},
   {w:"WHAT",q:"happened at night?",frame:"Suddenly, …",hint:"A storm? A strange noise? A dark cave?",cat:"problem"},
   {w:"HOW",q:"did you solve the problem?",frame:"After that, we…",hint:"Use a torch? Stay together?",cat:"problem"},
   {w:"WHY",q:"will you remember this trip?",frame:"I will never forget it because…",hint:"Was it lucky, frightening or wonderful?",cat:"end"}],
  cats:[{id:"start",name:"Beginning",hint:"Where and who?"},{id:"middle",name:"Middle",hint:"What happened first?"},{id:"problem",name:"Problem",hint:"What went wrong?"},{id:"end",name:"Ending",hint:"How did it end?"},{id:"feel",name:"Feelings",hint:"How did you feel?"}],
  vocab:[["camp","We set up camp near a lake.","nature"],["tent","Our tent was blue.","thing"],["torch","I switched on my torch.","thing"],["blanket","I had a warm blanket.","thing"],["path","We followed a narrow path.","nature"],["cave","We found a dark cave.","nature"],["dark","It was very dark.","nature"],["storm","A storm came at midnight.","nature"],["suddenly","Suddenly, we heard a noise.","time"],["adventure","It was a great adventure.","act"],["frightening","The thunder was frightening.","feel"],["lucky","We were lucky to be safe.","feel"]],
  starters:["Last holiday, we…","First, we…","Next, …","Suddenly, …","After that, …","In the end, …"],
  focus:[{label:"Put events in order (First, Next, After that, Finally)",re:"\\b(first|next|then|after that|finally|in the end)\\b"}]},
 {id:"y5-advice",title:"Dear Friend: Advice",theme:"self",std:"4.2.2 Ask for, give and respond to simple advice",grammar:"Imperatives; should",type:"Letter",glyph:"letter",
  task:"Your friend feels unhappy before a big competition. Write a letter with advice.",
  qs:[
   {w:"WHO",q:"are you writing to?",frame:"Dear…",hint:"Give your friend a name.",cat:"open"},
   {w:"WHAT",q:"is your friend’s problem?",frame:"I am sorry you feel…",hint:"Nervous? Alone? Not ready?",cat:"open"},
   {w:"WHAT",q:"should your friend do first?",frame:"First, you should…",hint:"Practise every day? Sleep early?",cat:"advice"},
   {w:"WHAT",q:"should your friend not do?",frame:"Don’t…",hint:"Don’t give up? Don’t stay up late?",cat:"advice"},
   {w:"HOW",q:"can you help?",frame:"I can…",hint:"Practise together? Come and watch?",cat:"help"},
   {w:"WHY",q:"will your friend be fine?",frame:"I think you will be fine because…",hint:"What is your friend good at?",cat:"close"}],
  cats:[{id:"open",name:"Greeting",hint:"Who? What is wrong?"},{id:"advice",name:"Advice",hint:"Should / Don’t"},{id:"help",name:"My Help",hint:"What can you do?"},{id:"cheer",name:"Encouragement",hint:"Kind words"},{id:"close",name:"Closing",hint:"How will you end?"}],
  vocab:[["dear","Dear Aina,","letter"],["letter","I am writing this letter to help you.","letter"],["problem","Every problem has an answer.","feel"],["should","You should sleep early.","act"],["unhappy","Don’t be unhappy.","feel"],["alone","You are not alone.","person"],["perhaps","Perhaps we can practise together.","feel"],["improve","You will improve every day.","act"],["ready","You will be ready soon.","feel"],["friendly","The judges are friendly.","person"],["instead","Instead of worrying, try your best.","act"],["team","Your team believes in you.","person"]],
  starters:["Dear…,","I am sorry you feel…","First, you should…","Don’t…","I can…","Your friend,"],
  focus:[{label:"Give advice (You should…, Don’t…, Try to…)",re:"\\b(should|shouldn['’]t|don['’]t|do not|try to)\\b"}]},
 {id:"y5-town",title:"The Best Place in My Town",theme:"know",std:"4.2.4 Describe people, places and objects using suitable statements",grammar:"Comparatives and superlatives",type:"Article",glyph:"place",
  task:"Write a short article about the best place to visit in your town.",
  qs:[
   {w:"WHERE",q:"is the best place in your town?",frame:"The best place in my town is…",hint:"A museum? A restaurant? A park?",cat:"place"},
   {w:"WHERE",q:"is it?",frame:"It is near… on the east/west side…",hint:"Next to the railway? On the corner?",cat:"where"},
   {w:"WHAT",q:"does it look like?",frame:"It is the… building…",hint:"Enormous? Old? Colourful?",cat:"looks"},
   {w:"WHAT",q:"can visitors do there?",frame:"Visitors can…",hint:"Eat, learn, take photos?",cat:"do"},
   {w:"WHEN",q:"is the best time to go?",frame:"The best time to go is…",hint:"Morning? The weekend? During a festival?",cat:"do"},
   {w:"WHY",q:"is it better than other places?",frame:"It is more… than… because…",hint:"Compare it with another place.",cat:"why"}],
  cats:[{id:"place",name:"The Place",hint:"What is it?"},{id:"where",name:"Location",hint:"Where is it?"},{id:"looks",name:"Description",hint:"What is it like?"},{id:"do",name:"Things To Do",hint:"What can you do?"},{id:"why",name:"Why It’s The Best",hint:"Compare it."}],
  vocab:[["museum","The museum has old stones.","place"],["restaurant","The restaurant sells delicious food.","place"],["hotel","Tourists stay at the hotel.","place"],["castle","It looks like a castle.","place"],["railway","It is next to the railway.","travel"],["entrance","The entrance is big.","place"],["corner","It is on the corner.","place"],["east","It is on the east side of town.","place"],["popular","It is the most popular place.","feel"],["enormous","It has an enormous garden.","thing"],["noisy","The market is noisier than the park.","feel"],["visit","Many people visit every day.","act"]],
  starters:["The best place in my town is…","It is near…","It is the… building in…","Visitors can…","It is better than… because…"],
  focus:[{label:"Compare (bigger than, the best, the most popular)",re:"\\b\\w+er than\\b|\\bmore \\w+ than\\b|\\bthe (best|most|\\w+est)\\b"}]},
 {id:"y5-cook",title:"Pancake Day",theme:"know",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Conjunctions: and, but, so; imperatives",type:"Recount with steps",glyph:"food",
  task:"Write about a day you cooked something with your family. Join your ideas with and, but or so.",
  qs:[
   {w:"WHEN",q:"did you cook?",frame:"Last Sunday, my family and I…",hint:"A weekend? A holiday? A festival?",cat:"start"},
   {w:"WHAT",q:"did you make?",frame:"We made…",hint:"Pancakes? Biscuits? A pizza?",cat:"start"},
   {w:"WHAT",q:"did you need?",frame:"We needed…",hint:"Flour, butter, sugar, honey?",cat:"need"},
   {w:"HOW",q:"did you make it?",frame:"First, we mixed…",hint:"Mix, cut, fill, put it in the oven.",cat:"steps"},
   {w:"WHAT",q:"went wrong or right?",frame:"…but…, so…",hint:"Did something burn? Was it perfect?",cat:"steps"},
   {w:"WHY",q:"was it a good day?",frame:"It was a lovely day because…",hint:"How did it taste? How did you feel?",cat:"end"}],
  cats:[{id:"start",name:"Beginning",hint:"When? What?"},{id:"need",name:"Ingredients",hint:"What did you need?"},{id:"steps",name:"Steps",hint:"What did you do?"},{id:"end",name:"Ending",hint:"How did it end?"},{id:"feel",name:"Feelings",hint:"How did it taste?"}],
  vocab:[["pancake","We made pancakes.","food"],["flour","First, we put flour in a bowl.","food"],["butter","We added some butter.","food"],["sugar","Don’t add too much sugar.","food"],["honey","I put honey on top.","food"],["mix","Mix it slowly.","act"],["oven","The oven was very hot.","thing"],["spoon","Use a big spoon.","thing"],["delicious","It was delicious!","feel"],["meal","It was a happy meal.","food"],["fridge","We kept the milk in the fridge.","thing"],["finish","We finished at midday.","time"]],
  starters:["Last Sunday, my family and I…","We needed… and…","First, we…, and then…","…but…, so…","It was a lovely day because…"],
  focus:[{label:"Join ideas with but or so",re:"\\b(but|so)\\b"}]},
 {id:"y5-space",title:"My Trip to Space",theme:"stories",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Will / won’t for predictions",type:"Imaginative story",glyph:"space",
  task:"Imagine you will travel to space next year. Write what will happen.",
  qs:[
   {w:"WHERE",q:"will you go in space?",frame:"Next year, I will travel to…",hint:"The moon? A new planet?",cat:"plan"},
   {w:"HOW",q:"will you get there?",frame:"I will fly in a…",hint:"A rocket? A silver spaceship?",cat:"plan"},
   {w:"WHO",q:"will go with you?",frame:"… will come with me.",hint:"A friend? A team of scientists?",cat:"crew"},
   {w:"WHAT",q:"will you see?",frame:"I will see…",hint:"Stars, rocks, a far planet?",cat:"see"},
   {w:"WHAT",q:"won’t you have in space?",frame:"I won’t have…",hint:"No pizza? No rain?",cat:"see"},
   {w:"WHY",q:"will it be a wonderful trip?",frame:"It will be wonderful because…",hint:"How will you feel?",cat:"feel"}],
  cats:[{id:"plan",name:"The Plan",hint:"Where? How?"},{id:"crew",name:"The Crew",hint:"Who is coming?"},{id:"see",name:"In Space",hint:"What will you see?"},{id:"problem",name:"A Problem",hint:"What might go wrong?"},{id:"feel",name:"Feelings",hint:"How will you feel?"}],
  vocab:[["planet","We will land on a new planet.","space"],["rocket","The rocket will be fast.","space"],["spaceship","Our spaceship is silver.","space"],["space","Space is dark and quiet.","space"],["silver","The moon looks silver.","thing"],["gold","The stars shine like gold.","thing"],["far","The planet is very far.","space"],["minute","Every minute will be exciting.","time"],["wonderful","It will be wonderful!","feel"],["excited","I will feel excited.","feel"],["enormous","We will see an enormous rock.","thing"],["early","We will leave early in the morning.","time"]],
  starters:["Next year, I will travel to…","I will fly in a…","I will see…","I won’t…","It will be wonderful because…"],
  focus:[{label:"Predict with will or won’t",re:"\\b(will|won['’]t|['’]ll)\\b"}]}
],
/* ---------------- YEAR 6 ---------------- */
6:[
 {id:"y6-job",title:"My Future Job",theme:"self",std:"4.2.2 Describe future plans or events",grammar:"Will and going to",type:"Blog post",glyph:"job",
  task:"Write two paragraphs about the job you hope to do in the future and how you will get there.",
  qs:[
   {w:"WHAT",q:"job do you hope to do?",frame:"In the future, I hope to be…",hint:"An astronaut? An engineer? A journalist?",cat:"job"},
   {w:"WHAT",q:"does this person do?",frame:"A… is someone who…",hint:"Explain the job in one sentence.",cat:"job"},
   {w:"WHERE",q:"will you study?",frame:"I am going to study… at…",hint:"Which subject? Which university?",cat:"plan"},
   {w:"HOW",q:"will you prepare?",frame:"Now, I am going to…",hint:"Read more? Join a club? Study science?",cat:"plan"},
   {w:"WHO",q:"inspires you?",frame:"… inspires me because…",hint:"A family member? Someone famous?",cat:"why"},
   {w:"WHY",q:"is this job important?",frame:"This job is important because…",hint:"How will it help people?",cat:"why"}],
  cats:[{id:"job",name:"The Job",hint:"What is it?"},{id:"plan",name:"My Plan",hint:"Study and practise"},{id:"why",name:"Reasons",hint:"Why this job?"},{id:"help",name:"Helping Others",hint:"Who will it help?"},{id:"dream",name:"My Dream Day",hint:"One day at work"}],
  vocab:[["astronaut","An astronaut works in space.","job"],["engineer","An engineer designs bridges.","job"],["journalist","A journalist writes the news.","job"],["scientist","A scientist does experiments.","job"],["photographer","A photographer takes pictures.","job"],["pilot","The pilot flies the plane.","job"],["designer","She is a clothes designer.","job"],["university","I will go to university.","place"],["study","I am going to study science.","act"],["future","In the future, I will travel.","time"],["hope","I hope to help people.","feel"],["important","Doctors are important.","feel"]],
  starters:["In the future, I hope to be…","A… is someone who…","I am going to study…","… inspires me because…","This job is important because…"],
  focus:[{label:"Talk about the future (will, going to, hope to)",re:"\\b(will|['’]ll|going to|hope to|plan to)\\b"}]},
 {id:"y6-eco",title:"Save Our Environment",theme:"know",std:"4.2.1 Give detailed information about themselves and others",grammar:"First conditional; must / should",type:"Article",glyph:"eco",
  task:"Write an article for the school magazine telling pupils how to protect the environment.",
  qs:[
   {w:"WHAT",q:"problem do you see around you?",frame:"In our school, there is too much…",hint:"Litter? Plastic? Wasted energy?",cat:"problem"},
   {w:"WHERE",q:"do you see this problem?",frame:"I often see it near…",hint:"The canteen? The river? The road?",cat:"problem"},
   {w:"WHAT",q:"should pupils do?",frame:"We should / must…",hint:"Recycle? Turn off the lights?",cat:"action"},
   {w:"WHAT",q:"will happen if we do nothing?",frame:"If we do nothing, …will…",hint:"Animals? The climate? Our rivers?",cat:"result"},
   {w:"HOW",q:"can your class help?",frame:"Our class can…",hint:"Start a recycling club? Make posters?",cat:"action"},
   {w:"WHY",q:"should everyone care?",frame:"We must protect it because…",hint:"Think about the future.",cat:"why"}],
  cats:[{id:"problem",name:"The Problem",hint:"What is wrong?"},{id:"action",name:"Actions",hint:"What must we do?"},{id:"result",name:"Results",hint:"If…, … will…"},{id:"why",name:"Reasons",hint:"Why care?"},{id:"call",name:"Call to Action",hint:"Your final message"}],
  vocab:[["recycle","We should recycle paper.","eco"],["rubbish","Put rubbish in the bin.","eco"],["litter","Don’t drop litter.","eco"],["plastic","Use less plastic.","eco"],["environment","We must protect the environment.","eco"],["protect","We must protect animals.","eco"],["energy","Save energy at school.","eco"],["climate","The climate is changing.","nature"],["save","Save water every day.","eco"],["fumes","Car fumes make the air dirty.","eco"],["natural","Rivers are natural resources.","nature"],["resource","Water is a precious resource.","eco"]],
  starters:["In our school, there is too much…","We must…","If we…, we will…","If we do nothing, …","Let’s… together!"],
  focus:[{label:"Use If…, … will… (first conditional)",re:"\\bif\\b[^.!?]*\\b(will|['’]ll|won['’]t)\\b"}]},
 {id:"y6-mystery",title:"The Museum Mystery",theme:"stories",std:"4.2.3 Narrate factual and imagined events and experiences",grammar:"Past continuous with past simple; speech marks",type:"Story",glyph:"space",
  task:"Write a mystery story. Something goes missing at the museum! Use speech marks for one character.",
  qs:[
   {w:"WHO",q:"is in your story?",frame:"…and her friend were visiting…",hint:"You, a friend, a zookeeper, a guard?",cat:"chars"},
   {w:"WHERE",q:"does it happen?",frame:"It happened at the…",hint:"A dinosaur museum? A science museum?",cat:"setting"},
   {w:"WHAT",q:"were they doing when it happened?",frame:"They were… when…",hint:"Use was/were + -ing.",cat:"problem"},
   {w:"WHAT",q:"went missing?",frame:"Suddenly, the… disappeared!",hint:"A dinosaur bone? A strange creature?",cat:"problem"},
   {w:"HOW",q:"did they solve it?",frame:"They searched… and found…",hint:"Follow footprints? Find a hole?",cat:"solve"},
   {w:"WHAT",q:"did someone say?",frame:"“…,” said…",hint:"Write it in speech marks.",cat:"solve"}],
  cats:[{id:"chars",name:"Characters",hint:"Who?"},{id:"setting",name:"Setting",hint:"Where and when?"},{id:"problem",name:"Problem",hint:"What happened?"},{id:"solve",name:"Solution",hint:"How was it solved?"},{id:"end",name:"Ending",hint:"How does it end?"}],
  vocab:[["missing","The golden bone was missing!","thing"],["strange","They heard a strange sound.","feel"],["disappear","The light began to disappear.","act"],["search","They searched every room.","act"],["believe","“I can’t believe it!” she said.","feel"],["dinosaur","A huge dinosaur stood in the hall.","nature"],["creature","A small creature ran past.","nature"],["explore","They explored the dark corridor.","act"],["hole","There was a hole in the wall.","thing"],["follow","They followed the footprints.","act"],["unusual","It was an unusual night.","feel"],["worried","The guard looked worried.","feel"]],
  starters:["One evening, … were visiting…","They were… when…","Suddenly, …","“…,” said…","In the end, …"],
  focus:[{label:"Use was/were + -ing (past continuous)",re:"\\b(was|were) \\w+ing\\b"},{label:"Use speech marks for someone talking",re:"[\"“”]"}]},
 {id:"y6-admire",title:"A Person I Admire",theme:"self",std:"4.2.4 Describe personality",grammar:"Used to; present perfect",type:"Profile",glyph:"person",
  task:"Write about a person you admire. Describe their personality and what they have done.",
  qs:[
   {w:"WHO",q:"do you admire?",frame:"The person I admire most is…",hint:"A teacher? An artist? A family member?",cat:"who"},
   {w:"WHAT",q:"is their personality like?",frame:"She/He is… and…",hint:"Kind, hard-working, patient, funny?",cat:"person"},
   {w:"WHAT",q:"did they use to do?",frame:"When she/he was young, she/he used to…",hint:"Use used to.",cat:"past"},
   {w:"WHAT",q:"have they done?",frame:"She/He has…",hint:"Has won? Has helped? Has joined a charity?",cat:"done"},
   {w:"HOW",q:"have they changed your life?",frame:"She/He has taught me…",hint:"What have you learnt from them?",cat:"me"},
   {w:"WHY",q:"are they special?",frame:"I admire… because…",hint:"Give two reasons.",cat:"me"}],
  cats:[{id:"who",name:"Who",hint:"Who is it?"},{id:"person",name:"Personality",hint:"What are they like?"},{id:"past",name:"The Past",hint:"Used to…"},{id:"done",name:"Achievements",hint:"Has / have…"},{id:"me",name:"Impact on Me",hint:"Why it matters"}],
  vocab:[["artist","My aunt is an artist.","job"],["singer","The singer has performed on stage.","job"],["actor","He used to be an actor.","job"],["kind","She is kind and patient.","feel"],["special","She is special to me.","feel"],["excellent","He is an excellent teacher.","feel"],["believe","She believes in me.","feel"],["remember","I remember her kind words.","feel"],["join","He has joined a charity.","act"],["charity","She works for a charity.","person"],["perform","He performs every weekend.","act"],["hope","She gives me hope.","feel"]],
  starters:["The person I admire most is…","She/He is… and…","When she/he was young, she/he used to…","She/He has…","I admire… because…"],
  focus:[{label:"Use used to or has/have + done (has won, have helped)",re:"\\bused to\\b|\\b(has|have|['’]ve|['’]s) (been|done|won|helped|taught|made|joined|given|performed|shown|worked|written|travelled|built)\\b"}]},
 {id:"y6-festival",title:"A Festival We Celebrate",theme:"know",std:"4.2.1 Give detailed information about themselves and others",grammar:"Passive voice; present simple for future events",type:"Information text",glyph:"star",
  task:"Write about a festival in Malaysia that you celebrate or know about.",
  qs:[
   {w:"WHAT",q:"festival will you write about?",frame:"… is celebrated by…",hint:"Hari Raya, Chinese New Year, Deepavali, Gawai, Christmas?",cat:"what"},
   {w:"WHEN",q:"is it celebrated?",frame:"It starts on… / It is celebrated in…",hint:"Which month or season?",cat:"what"},
   {w:"HOW",q:"do families prepare?",frame:"Houses are cleaned and…",hint:"Use is/are + -ed: is decorated, are baked.",cat:"prepare"},
   {w:"WHAT",q:"food is eaten?",frame:"…is served / are baked.",hint:"Cakes? Special dishes?",cat:"food"},
   {w:"WHERE",q:"do people go?",frame:"Many people make a journey to…",hint:"Their hometown? Friends’ houses?",cat:"do"},
   {w:"WHY",q:"is this festival special?",frame:"It is special because…",hint:"Family? Sharing? Respect?",cat:"why"}],
  cats:[{id:"what",name:"The Festival",hint:"What and when?"},{id:"prepare",name:"Preparation",hint:"What is done?"},{id:"food",name:"Food",hint:"What is served?"},{id:"do",name:"Activities",hint:"What do people do?"},{id:"why",name:"Meaning",hint:"Why is it special?"}],
  vocab:[["festival","Our favourite festival is coming.","star"],["prepare","We prepare for weeks.","act"],["bake","Cookies are baked at home.","food"],["light","Lights are hung outside.","star"],["journey","We make a long journey home.","travel"],["taste","The cakes taste sweet.","food"],["smell","I love the smell of the food.","food"],["fresh","Fresh flowers are bought.","nature"],["collect","We collect gifts for others.","act"],["stay","We stay with our grandparents.","place"],["tonight","The fireworks start tonight.","time"],["music","Traditional music is played.","act"]],
  starters:["… is celebrated by…","It starts on…","Houses are… and…","Special food is…","It is special because…"],
  focus:[{label:"Use a passive sentence (is celebrated, are baked)",re:"\\b(is|are|was|were) \\w+(ed|en)\\b"}]},
 {id:"y6-invent",title:"If I Invented a Machine",theme:"stories",std:"4.2.2 Describe future plans or events",grammar:"Modal verbs for speculation: may, might, could",type:"Proposal",glyph:"tool",
  task:"Invent a new machine. Describe it and say what it might do for people.",
  qs:[
   {w:"WHAT",q:"machine would you invent?",frame:"I would invent a machine that…",hint:"A homework helper? A litter robot?",cat:"what"},
   {w:"WHAT",q:"does it look like?",frame:"It is made of… and has…",hint:"Metal? A screen? Wheels?",cat:"looks"},
   {w:"HOW",q:"does it work?",frame:"First, you… then it…",hint:"Explain the steps.",cat:"how"},
   {w:"WHO",q:"would use it?",frame:"It might help…",hint:"Children? Older people? Farmers?",cat:"who"},
   {w:"WHAT",q:"could go wrong?",frame:"It could… so I would…",hint:"How would you repair it?",cat:"how"},
   {w:"WHY",q:"is it a good invention?",frame:"It may change the world because…",hint:"Use may, might or could.",cat:"why"}],
  cats:[{id:"what",name:"The Invention",hint:"What is it?"},{id:"looks",name:"Design",hint:"What does it look like?"},{id:"how",name:"How It Works",hint:"Steps"},{id:"who",name:"Users",hint:"Who needs it?"},{id:"why",name:"Why It Matters",hint:"May / might / could"}],
  vocab:[["invent","I want to invent a robot.","tool"],["inventor","A young inventor made it.","job"],["machine","The machine is very quiet.","tool"],["engine","It has a small engine.","tool"],["electricity","It uses less electricity.","tool"],["experiment","I did an experiment.","tool"],["design","Look at my design.","tool"],["metal","It is made of metal.","thing"],["screen","It has a touch screen.","tool"],["wheel","It moves on four wheels.","tool"],["explain","Let me explain how it works.","act"],["repair","It can repair itself.","tool"]],
  starters:["I would invent a machine that…","It is made of… and has…","First, you…, then it…","It might help…","It may change the world because…"],
  focus:[{label:"Guess with may, might or could",re:"\\b(may|might|could)\\b"}]}
]};
/* support levels (UDL): same quest, different scaffolding */
const SUPPORT={
  lantern:{name:"Guide Me!",tag:"More support",n:3,f:.8,items:["Picture cards and vocabulary","5W1H questions with hints","Sentence starters"]},
  compass:{name:"Help Me a Little!",tag:"Some support",n:2,f:1,items:["Vocabulary suggestions","Guiding questions","Hints when you ask"]},
  wings:{name:"I Can Do It!",tag:"Independent",n:1,f:1.2,items:["Short prompts only","Plan and write on your own"]}
};
/* Enchanted Library shelves (each quest's writing is shelved here once the teacher approves it) */
const SHELVES=[
  {id:"adventures",name:"My Adventures",col:"#6b2a5a"},{id:"family",name:"My Family and Friends",col:"#5a2a7a"},
  {id:"places",name:"Amazing Places",col:"#1f4f8a"},{id:"creative",name:"Creative Stories",col:"#8a2a3a"},{id:"everyday",name:"Everyday Experiences",col:"#1f6a4a"}];
const SHELF_OF={"y4-weekend":"everyday","y4-picnic":"everyday","y4-party":"family","y4-hero":"family","y4-funfair":"adventures","y4-doctor":"everyday",
  "y5-me":"family","y5-camp":"adventures","y5-advice":"family","y5-town":"places","y5-cook":"everyday","y5-space":"creative",
  "y6-job":"everyday","y6-eco":"places","y6-mystery":"creative","y6-admire":"family","y6-festival":"places","y6-invent":"creative"};
/* character creator parts; some cosmetic items cost gems */
const LOOK={
  face:[{id:"round",name:"Round"},{id:"oval",name:"Oval"},{id:"heart",name:"Heart"}],
  hair:[{id:"short",name:"Short"},{id:"swept",name:"Swept"},{id:"crop",name:"Crop"},{id:"curly",name:"Curly"},{id:"long",name:"Long"},{id:"pony",name:"Ponytail"},{id:"bun",name:"Bun"},{id:"wavy",name:"Wavy"}],
  hairc:[{id:"black",name:"Black",c:["#2a2320","#0c0908"]},{id:"softblack",name:"Soft black",c:["#3a302c","#151010"]},{id:"brown",name:"Brown",c:["#5a3a24","#2a180c"]},{id:"chestnut",name:"Chestnut",c:["#7a4626","#3a1e0c"]},{id:"auburn",name:"Auburn",c:["#8a3a22","#40160a"]},{id:"ink",name:"Midnight blue",c:["#25305a","#0c1028"]}],
  skin:[{id:"s1",name:"Light peach",c:["#ffe2cc","#f0bc9a","#c98c6a"]},{id:"s2",name:"Warm beige",c:["#f6d0b0","#e0a882","#b07452"]},{id:"s3",name:"Golden tan",c:["#e8b48c","#c98c62","#946040"]},{id:"s4",name:"Warm brown",c:["#c88e64","#a86c44","#74462a"]},{id:"s5",name:"Deep brown",c:["#9e6a46","#7e4e30","#52301c"]},{id:"s6",name:"Rich brown",c:["#7a4e32","#5e3822","#3a2012"]}],
  eyes:[{id:"brown",name:"Brown",c:"#5a3418"},{id:"dark",name:"Dark brown",c:"#2a1a10"},{id:"hazel",name:"Hazel",c:"#7a6a2a"},{id:"grey",name:"Grey",c:"#5a6a78"},{id:"blue",name:"Blue",c:"#3a6aa0"}],
  head:[{id:"none",name:"None"},{id:"kopiah",name:"Kopiah"},{id:"turban",name:"Turban"},{id:"hat",name:"Wizard hat",gems:3},{id:"circlet",name:"Star circlet",gems:5}],
  robe:[{id:"house",name:"House colours"},{id:"midnight",name:"Midnight",c:["#2a3a7a","#0e1638"]},{id:"forest",name:"Forest",c:["#2a6a4a","#0e2a1e"]},{id:"wine",name:"Wine",c:["#7a2a3e","#2e0c16"]},{id:"ash",name:"Ash",c:["#6a6e78","#2a2c32"]},{id:"royal",name:"Royal purple",c:["#3a2a6a","#140c2e"],gems:4}],
  acc:[{id:"none",name:"None"},{id:"glasses",name:"Glasses"},{id:"book",name:"Spellbook"},{id:"quill",name:"Golden quill",gems:2},{id:"hornbill",name:"Hornbill pin",gems:4}]
};
/* Treasure Vault shop: bought with gems, then equipped */
LOOK.wand=[{id:"none",name:"No wand"},{id:"cengal",name:"Cengal wand",c:["#8a5a34","#4a2c16"],tip:"#f3dc9a"},{id:"meranti",name:"Meranti wand",c:["#b0563a","#5e2814"],tip:"#ffb27a",gems:2},{id:"rattan",name:"Rattan wand",c:["#d6b47a","#8a6a3a"],tip:"#c9f2d6",gems:2},{id:"ebony",name:"Ebony wand",c:["#3a3438","#121014"],tip:"#c9b8ff",gems:3},{id:"pearl",name:"Pearlwood wand",c:["#efe6da","#a89c8c"],tip:"#bfe6ff",gems:4}];
LOOK.pet=[{id:"none",name:"No pet"},{id:"firefly",name:"Kelip-kelip (firefly)",gems:2},{id:"hornbill",name:"Baby hornbill",gems:4},{id:"tiger",name:"Tiger cub",gems:4},{id:"turtle",name:"Baby turtle",gems:4}];
const PRESETS=[
  {face:"round",hair:"swept",hairc:"black",skin:"s2",eyes:"dark",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"},
  {face:"oval",hair:"long",hairc:"black",skin:"s1",eyes:"brown",head:"none",robe:"house",acc:"book",wand:"none",pet:"none"},
  {face:"heart",hair:"wavy",hairc:"black",skin:"s3",eyes:"brown",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"},
  {face:"round",hair:"crop",hairc:"black",skin:"s5",eyes:"dark",head:"none",robe:"house",acc:"glasses",wand:"none",pet:"none"},
  {face:"oval",hair:"curly",hairc:"brown",skin:"s4",eyes:"hazel",head:"none",robe:"house",acc:"none",wand:"none",pet:"none"},
  {face:"heart",hair:"pony",hairc:"chestnut",skin:"s2",eyes:"grey",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"}
];
const RANKS=["Novice","Apprentice","Scribe","Wordsmith","Sage","Archmage"];
/* Collector's Vault: star tiers (shown as "next reward") + rare items from writing challenges */
const STAR_TIERS=[
  {id:"bronze",name:"Bronze Inkwell",stars:10,icon:"inkwell",metal:"bronze"},
  {id:"silver",name:"Silver Lantern",stars:25,icon:"lantern",metal:"silver"},
  {id:"gold",name:"Golden Scroll",stars:50,icon:"scroll",metal:"gold"},
  {id:"crown",name:"Master’s Crown",stars:80,icon:"crown",metal:"gold"}
];
const TROPHIES=[
  ...STAR_TIERS.map(t=>({...t,desc:`Collect ${t.stars} stars`,tier:1,test:s=>s.starsTotal>=t.stars})),
  {id:"first",name:"First Quill",desc:"Finish your first quest",icon:"quill",test:s=>s.history.length>=1},
  {id:"potion",name:"Potion of Words",desc:"Catch every word without a miss in Catch the Missing Words",icon:"potion",test:s=>s.history.some(h=>h.gamePerfect)},
  {id:"ember",name:"Ember Candle",desc:"Keep a 3-day streak",icon:"candle",test:s=>s.bestStreak>=3},
  {id:"flame",name:"Everflame",desc:"Keep a 7-day streak",icon:"flame",test:s=>s.bestStreak>=7},
  {id:"moon",name:"Moon Charm",desc:"Complete 5 daily quests on their day",icon:"moon",test:s=>s.history.filter(h=>h.daily).length>=5},
  {id:"tome",name:"Wordkeeper’s Tome",desc:"Use 20 quest words in your writing",icon:"tome",test:s=>s.history.reduce((n,h)=>n+(h.vocabUsed||0),0)>=20},
  {id:"map",name:"Detective’s Map",desc:"Pin 10 details on your evidence boards",icon:"map",test:s=>s.history.reduce((n,h)=>n+(h.details||0),0)>=10},
  {id:"perfect",name:"Crystal Orb",desc:"Earn 5 stars in one quest",icon:"orb",test:s=>s.history.some(h=>h.stars>=5)},
  {id:"bookmark",name:"Enchanted Bookmark",desc:"Complete quests from all three DSKP themes",icon:"bookmark",test:s=>new Set(s.history.map(h=>h.theme)).size>=3},
  {id:"badge",name:"House Badge",desc:"Complete 3 different house quests",icon:"badge",test:s=>new Set(s.history.map(h=>h.quest)).size>=3},
  {id:"seal",name:"Professor’s Seal",desc:"Receive written feedback from your teacher",icon:"seal",test:s=>s.history.some(h=>h.review)},
  {id:"author",name:"Published Author’s Pen",desc:"Have a piece approved for the Enchanted Library",icon:"quill",metal:"gold",test:s=>s.history.some(h=>h.approved)},
  {id:"champion",name:"House Chalice",desc:"Complete all 6 quests of your house",icon:"chalice",test:s=>QUESTS[s.year]&&QUESTS[s.year].every(q=>s.history.some(h=>h.quest===q.id))}
];
const ROBES=[{id:"house",name:"House colours"},{id:"midnight",name:"Midnight",c:["#1d2a52","#0b1128"]},{id:"forest",name:"Forest",c:["#1f4a36","#0b1f16"]},{id:"wine",name:"Wine",c:["#5a1f2e","#250a12"]},{id:"ash",name:"Ash",c:["#5a5e66","#24262b"]}];
const WANDS=[
  {id:"cengal",name:"Cengal",desc:"Strong and steady",wood:["#8a5a34","#4a2c16"],tip:"#f3dc9a"},
  {id:"meranti",name:"Meranti",desc:"Warm and bright",wood:["#b0563a","#5e2814"],tip:"#ffb27a"},
  {id:"rattan",name:"Rattan",desc:"Flexible and quick",wood:["#d6b47a","#8a6a3a"],tip:"#c9f2d6"},
  {id:"ebony",name:"Ebony",desc:"Deep and wise",wood:["#3a3438","#121014"],tip:"#c9b8ff"},
  {id:"pearl",name:"Pearlwood",desc:"Calm and clear",wood:["#efe6da","#a89c8c"],tip:"#bfe6ff"}
];
