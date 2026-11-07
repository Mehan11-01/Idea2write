/* Photographic cues for concrete words; abstract terms retain explicitly labelled photo context. */
const VOCAB_REAL_BASE='assets/vocabulary/new-realistic/';
function photoWords(words,file,alt,context=false){registerVocabPicture(words,VOCAB_REAL_BASE+file+'.webp',alt);if(context)for(const word of words.split('|'))VOCABULARY_PICTURES[word].context=true;}
photoWords('invite|invitation|letter|envelope|present|gift','invitation','A pupil hands an invitation envelope to a friend; a wrapped gift is on the table.');
photoWords('party|celebration|open house|guest|guests|join|reply|address|everyone|wait|friendly|surprised','invitation','Photographic context: two friends exchange an invitation at a welcoming family home.',true);
photoWords('doctor|nurse|temperature|thermometer','clinic','A doctor and nurse check a fully clothed child’s temperature at a clinic.');
photoWords('headache|cough|hospital|earache|ill|sick|better|careful','clinic','Photographic context: a child with a parent receives gentle care from a doctor and nurse.',true);
photoWords('brush|toothbrush|toothpaste','brush','A pupil brushes his teeth at a bathroom sink, with a toothbrush and toothpaste.');
photoWords('breakfast|canteen|recess|cup|uniform','canteen','Pupils in school uniform eat breakfast from trays and drink from cups at a school canteen.');
photoWords('lesson|healthy|member|team|share','canteen','Photographic context: classmates share a friendly school canteen table.',true);
photoWords('pencil case|zip|pocket|rectangular|colourful|shiny|smooth|wooden','stationery','A rectangular fabric pencil case with a zip and pocket sits beside coloured pencils, a wooden ruler and a shiny pen.');
photoWords('light|useful|material|durable','stationery','Photographic context: everyday pencil-case materials and useful school stationery on a desk.',true);
photoWords('feathers|scales|rabbit|bird|fish','animals','A feathered bird, rabbit, goldfish in a clear aquarium and striped cat at an animal education centre.');
photoWords('crawl|hop|playful|creature','animals','Photographic context: a rabbit, bird, fish and cat show different kinds of animals.',true);
photoWords('flour|butter|sugar|honey|spoon|mix|oven|fridge','ingredients','Flour, butter, sugar, honey, a wooden spoon and pancake batter on a real kitchen counter, with an oven and fridge behind.');
photoWords('prepare|bake|finish|meal|delicious','ingredients','Photographic context: ingredients and utensils ready for baking pancakes in a kitchen.',true);
photoWords('restaurant|hotel|bus|railway|entrance|corner','town','A real town street with a restaurant, hotel, bus and railway entrance.');
photoWords('east|popular|enormous|noisy|visit|crowded|journey|arrived|trip|ride','town','Photographic context: a busy town street with buildings, transport and people.',true);
photoWords('chess|violin|volleyball','hobbies','One pupil plays a violin, two pupils play chess and a volleyball lies nearby in a school activity room.');
photoWords('interest|hobby|interested|competition|improve|strength|prefer|confident|curious|creative|talented|favourite|ambition|skill|cooperate|friendship|perform|music','hobbies','Photographic context: pupils enjoy music, chess and sport in a school activity room.',true);
photoWords('engineer|scientist|machine|engine|electricity|experiment|metal|screen|wheel|repair','experiment','An engineer and pupil examine a small electric motor, metal parts, wires, wheels and a screen at a science workbench.');
photoWords('invent|inventor|design|designer|explain|study|future|hope|important|responsible|determined|dedicated','experiment','Photographic context: a supervised science workshop explores engineering and invention.',true);
photoWords('luggage|pack|itinerary|planner|map','luggage','An open suitcase with neatly packed clothes, a travel planner and a folded map in a homestay room.');
photoWords('destination|accommodation|book|looking forward to|explore|scenic|homestay|ready|organise|tidy|arrange|timetable|routine|remind|due date','luggage','Photographic context: a suitcase and planner are prepared for a family journey.',true);
photoWords('kuih|festival','festival','A grandmother and child prepare colourful kuih in a family kitchen decorated for a celebration.');
photoWords('taste|smell|fresh|collect|stay|tonight|sweet|cheerful|caring|patient|gentle|relative|generous|spend time|unforgettable|memorable','festival','Photographic context: a family prepares festive kuih together in their kitchen.',true);
// The same scene photographs provide more specific topic covers than generic scenery.
TOPIC_ART['y4-party']={src:VOCAB_REAL_BASE+'invitation.webp',alt:'A pupil gives a party invitation to a friend at the doorway.'};
TOPIC_ART['y5-town']={src:VOCAB_REAL_BASE+'town.webp',alt:'A real Malaysian town street with shops, a bus and railway entrance.'};
TOPIC_ART['y6-job']={src:VOCAB_REAL_BASE+'experiment.webp',alt:'An engineer helps a pupil explore an electrical machine at a science workbench.'};
// Open-house guests have their own scene rather than reusing the invitation exchange.
registerVocabPicture('celebration|open house|guest|guests',REALISTIC_TOPIC_PICTURES.celebration.src,REALISTIC_TOPIC_PICTURES.celebration.alt);
