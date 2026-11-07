/* Photo-only mission artwork. Load after topic-art.js. Existing exact-topic
   photographs remain intact; no mission or generic fallback uses SVG art. */
const REALISTIC_TOPIC_PICTURES={
  routine:{src:'assets/topics/realistic/routine.webp',alt:'A pupil wakes up and stretches in a sunlit bedroom.'},
  someone:{src:'assets/topics/realistic/someone.webp',alt:'A grandmother and her grandchild smile together in a home garden.'},
  object:{src:'assets/topics/realistic/object.webp',alt:'A pupil writes at a desk with an exercise book and a pink pencil case.'},
  celebration:{src:'assets/topics/realistic/celebration.webp',alt:'A Malaysian family welcomes guests to a festive open house.'},
  activity:{src:'assets/topics/realistic/activity.webp',alt:'Two pupils play badminton across a school court net.'},
  aboutme:{src:'assets/topics/realistic/aboutme.webp',alt:'A pupil shows personal interests with books, a sketchbook and a football.'},
  place:{src:'assets/topics/realistic/place.webp',alt:'A traditional kampung house stands beside green paddy fields and coconut trees.'},
  memorable:{src:'assets/topics/realistic/memorable.webp',alt:'A family enjoys a beach day while children build a sandcastle.'},
  advice:{src:'assets/topics/realistic/advice.webp',alt:'A pupil considers a pile of homework books and loose papers at a desk.'},
  wau:{src:'assets/topics/realistic/wau.webp',alt:'A child flies a traditional wau bulan kite in a grassy field.'},
  person:{src:'assets/topics/realistic/person.webp',alt:'An uncle and child water plants together in a home garden.'},
  holiday:{src:'assets/topics/realistic/holiday.webp',alt:'A family with luggage visits the tea plantation hills of Cameron Highlands.'},
  adventure:{src:'assets/topics/realistic/adventure.webp',alt:'Two pupils explore a cave entrance with torches and an adult guide.'},
  admire:{src:'assets/topics/realistic/admire.webp',alt:'A teacher helps a pupil with an exercise book in a bright classroom.'},
  event:{src:'assets/topics/realistic/event.webp',alt:'Pupils race across a school sports field while classmates cheer.'},
  getting:{src:'assets/topics/realistic/getting.webp',alt:'Two friends chat on a school bench with a sketchbook and a football.'},
  project:{src:'assets/topics/realistic/project.webp',alt:'Pupils sort recycling beside a classroom reading corner.'}
};
const REALISTIC_TOPIC_QUESTS={
'y4-weekend':'routine','y4-picnic':'picnic','y4-party':'birthday','y4-hero':'someone','y4-funfair':'funfair','y4-doctor':'doctor',
'legacy-y4-daily-routine':'routine','legacy-y4-someone-special':'someone','legacy-y4-favourite-object':'object','legacy-y4-celebration':'celebration','legacy-y4-favourite-activity':'activity','legacy-y4-animal':'cat',
'y5-me':'aboutme','y5-camp':'camping','y5-advice':'advice','y5-town':'place','y5-cook':'pancakes','y5-space':'space',
'legacy-y5-about-me':'aboutme','legacy-y5-place-i-love':'place','legacy-y5-memorable-day':'memorable','legacy-y5-helpful-advice':'advice','legacy-y5-meaningful-object':'wau','legacy-y5-special-person':'person',
'y6-job':'admire','y6-eco':'project','y6-mystery':'museum','y6-admire':'admire','y6-festival':'celebration','y6-invent':'robot',
'legacy-y6-holiday-plans':'holiday','legacy-y6-adventure':'adventure','legacy-y6-person-admire':'admire','legacy-y6-school-event':'event','legacy-y6-getting-to-know-us':'getting','legacy-y6-class-project':'project'
};
Object.entries(REALISTIC_TOPIC_QUESTS).forEach(([id,scene])=>{
  if(REALISTIC_TOPIC_PICTURES[scene]) TOPIC_ART[id]={...REALISTIC_TOPIC_PICTURES[scene]};
});
/* Also replace any residual SVG entry, including a future mission that reuses
   one of the old scene filenames. Unknown scenes get a photo of class writing. */
Object.entries(TOPIC_ART).forEach(([id,art])=>{
  if(/\.svg(?:$|[?#])/i.test(art.src)) {
    const scene=art.src.split('/').pop().replace(/\.svg.*$/i,'');
    TOPIC_ART[id]={...(REALISTIC_TOPIC_PICTURES[scene]||REALISTIC_TOPIC_PICTURES.object)};
  }
});
function topicArt(q){
  return TOPIC_ART[q?.id]||{src:'assets/topics/realistic/object.webp',alt:(q?.title||'Writing topic')+' — a pupil writing at a desk with books and a pencil case'};
}

// Every built-in mission has a distinct cover, including similar topics across years.
Object.assign(TOPIC_ART,{
 'y4-weekend':{src:'assets/vocabulary/lunch.webp',alt:'A family shares a relaxed weekend lunch around the dining table.'},
 'y4-hero':{src:'assets/vocabulary/help.webp',alt:'A father helps his child with homework at home.'},
 'y5-me':{src:'assets/vocabulary/new-realistic/hobbies.webp',alt:'Pupils explore their interests through music, chess and volleyball.'},
 'legacy-y5-helpful-advice':{src:'assets/topics/unique/helpful-advice.webp',alt:'A pupil organises homework using a weekly planner and tidy labelled folders.'},
 'y6-festival':{src:'assets/vocabulary/new-realistic/festival.webp',alt:'A grandmother and child prepare festive kuih together in a family kitchen.'},
 'legacy-y6-class-project':{src:'assets/topics/unique/class-project.webp',alt:'Classmates work together on a cardboard model using recycled materials.'},
 'y6-admire':{src:'assets/topics/unique/admired-artist.webp',alt:'A community artist paints a colourful mural while a pupil watches with admiration.'}
});
