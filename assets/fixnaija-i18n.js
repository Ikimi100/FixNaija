/* FixNaija · read the registration page in Hausa, Yorùbá, Igbo or Naija Pidgin
   ---------------------------------------------------------------------------
   Only the words people READ change. Everything the form SENDS stays exactly
   the same in every language: option values are fixed in English before any
   label is translated, and typed answers are never touched — so the admin
   dashboard counts are not affected.
   The choice is remembered on this device (fx_lang); a link can also open
   the page in a language with ?lang=ha | yo | ig | pcm.
   Translations: please have a native speaker review before big pushes.      */
(function(){
  'use strict';
  var LANGS=[['en','English'],['ha','Hausa'],['yo','Yorùbá'],['ig','Igbo'],['pcm','Pidgin']];
  var COL={ha:0,yo:1,ig:2,pcm:3};
  var D={
"Join the Movement":["Shiga Ƙungiyar","Darapọ̀ mọ́ Ẹgbẹ́ náà","Sonye na Òtù a","Join the Movement"],
"Take your seat":["Ka ɗauki kujerarka","Jókòó sí àyè rẹ","Were oche gị","Come take your seat"],
"at the table.":["a teburin.","ní tábìlì náà.","na tebụl ahụ.","for the table."],
"Register with FixNaija in about two minutes. We'll connect you with the organisers in your ward and polling unit — and keep you close to every step toward":["Yi rajista da FixNaija cikin kusan minti biyu. Za mu haɗa ka da masu tsarawa a mazaɓarka da rumfar zaɓenka — kuma mu sanar da kai kowane mataki har zuwa","Forúkọ sílẹ̀ pẹ̀lú FixNaija láàárín ìṣẹ́jú méjì. A ó so ọ́ pọ̀ mọ́ àwọn olùṣètò ní wọ́ọ̀dù àti ibùdó ìdìbò rẹ — a ó sì máa jẹ́ kí o mọ gbogbo ìgbésẹ̀ títí dé","Debanye aha na FixNaija n'ihe dị ka nkeji abụọ. Anyị ga-ejikọ gị na ndị nhazi nọ na wọọdụ gị na ebe ntuli aka gị — ma na-agwa gị ihe ọ bụla na-eme ruo","Register with FixNaija inside like two minutes. We go connect you with the organisers for your ward and polling unit — and carry you along every step till"],
"16 January 2027":["16 ga Janairu 2027","16 Oṣù Kínní 2027","16 Jenụwarị 2027","16 January 2027"],
"Private & secure":["Sirri da tsaro","Àṣírí àti ààbò","Nzuzo na nchekwa","Private and safe"],
"About 2 minutes":["Kusan minti 2","Nǹkan bí ìṣẹ́jú 2","Ihe dị ka nkeji 2","Like 2 minutes"],
"All 774 LGAs":["Dukkan Ƙananan Hukumomi 774","Gbogbo Ìjọba Ìbílẹ̀ 774","LGA 774 niile","All 774 LGAs"],
"already registered":["sun riga sun yi rajista","ti forúkọ sílẹ̀","edebanyelarị aha","don already register"],
"Your registration":["Rajistarka","Ìforúkọsílẹ̀ rẹ","Ndebanye aha gị","Your registration"],
"You":["Kai","Ìwọ","Gị","You"],
"Where you vote":["Inda kake zaɓe","Ibi tí o ti ń dìbò","Ebe ị na-atụ vootu","Where you dey vote"],
"Your group":["Ƙungiyarka","Ẹgbẹ́ rẹ","Otu gị","Your group"],
"About you":["Game da kai","Nípa rẹ","Gbasara gị","About you"],
"Tell us about you":["Faɗa mana game da kai","Sọ fún wa nípa ara rẹ","Gwa anyị gbasara gị","Tell us about yourself"],
"So your coordinator knows who to call.":["Don jami’in yankinku ya san wanda zai kira.","Kí olùṣètò rẹ lè mọ ẹni tí yóò pè.","Ka onye nhazi gị mara onye ọ ga-akpọ.","So your coordinator go know who to call."],
"First Name":["Suna na farko","Orúkọ àkọ́kọ́","Aha mbụ","First name"],
"Enter your first name":["Rubuta sunanka na farko","Kọ orúkọ àkọ́kọ́ rẹ","Dee aha mbụ gị","Write your first name"],
"Last Name":["Sunan mahaifi","Orúkọ ìdílé","Aha nna","Surname"],
"Enter your last name":["Rubuta sunan mahaifinka","Kọ orúkọ ìdílé rẹ","Dee aha nna gị","Write your surname"],
"Email Address":["Adireshin imel","Àdírẹ́sì ímeèlì","Adreesị email","Email address"],
"Phone Number":["Lambar waya","Nọ́ńbà fóònù","Nọmba ekwentị","Phone number"],
"WhatsApp Number":["Lambar WhatsApp","Nọ́ńbà WhatsApp","Nọmba WhatsApp","WhatsApp number"],
"Same as my phone number":["Daidai da lambar wayata","Bákan náà pẹ̀lú nọ́ńbà fóònù mi","Otu ihe ahụ dị ka nọmba ekwentị m","Na the same as my phone number"],
"Pick your state and LGA — then your ward and polling unit if you know them.":["Zaɓi jiharka da Ƙaramar Hukumarka — sannan mazaɓarka da rumfar zaɓenka idan ka san su.","Yan ìpínlẹ̀ àti Ìjọba Ìbílẹ̀ rẹ — lẹ́yìn náà wọ́ọ̀dù àti ibùdó ìdìbò rẹ tí o bá mọ̀ wọ́n.","Họrọ steeti gị na LGA gị — mgbe ahụ wọọdụ gị na ebe ntuli aka gị ma ọ bụrụ na ị ma ha.","Pick your state and LGA — then your ward and polling unit if you know dem."],
"State":["Jiha","Ìpínlẹ̀","Steeti","State"],
"Select your state":["Zaɓi jiharka","Yan ìpínlẹ̀ rẹ","Họrọ steeti gị","Choose your state"],
"LGA":["Ƙaramar Hukuma","Ìjọba Ìbílẹ̀","LGA","LGA"],
"Select your LGA":["Zaɓi Ƙaramar Hukumarka","Yan Ìjọba Ìbílẹ̀ rẹ","Họrọ LGA gị","Choose your LGA"],
"Ward / Registration Area":["Mazaɓa","Wọ́ọ̀dù","Wọọdụ","Ward / Registration Area"],
"— Select Ward —":["— Zaɓi Mazaɓa —","— Yan Wọ́ọ̀dù —","— Họrọ Wọọdụ —","— Choose Ward —"],
"Loading wards...":["Ana loda mazaɓu...","À ń gbé àwọn wọ́ọ̀dù jáde...","A na-ebudata wọọdụ...","Ward dey load..."],
"Polling Unit":["Rumfar zaɓe","Ibùdó ìdìbò","Ebe ntuli aka","Polling unit"],
"— Select Polling Unit —":["— Zaɓi Rumfar Zaɓe —","— Yan Ibùdó Ìdìbò —","— Họrọ Ebe Ntuli Aka —","— Choose Polling Unit —"],
"Loading polling units...":["Ana loda rumfunan zaɓe...","À ń gbé àwọn ibùdó ìdìbò jáde...","A na-ebudata ebe ntuli aka...","Polling units dey load..."],
"Your group & role":["Ƙungiyarka da matsayinka","Ẹgbẹ́ àti ipa rẹ","Otu gị na ọrụ gị","Your group and role"],
"Registering through a group? Choose it here — otherwise pick “New Registration”.":["Kana rajista ta hanyar wata ƙungiya? Zaɓe ta a nan — in ba haka ba, zaɓi “Sabuwar Rajista”.","Ṣé o ń forúkọ sílẹ̀ nípasẹ̀ ẹgbẹ́ kan? Yàn án níbí — bí bẹ́ẹ̀ kọ́, yan “Ìforúkọsílẹ̀ Tuntun”.","Ị na-edebanye aha site n'otu? Họrọ ya ebe a — ma ọ bụghị ya, họrọ “Ndebanye Aha Ọhụrụ”.","You dey register through one group? Choose am here — if not, pick “New Registration”."],
"Select Your Group":["Zaɓi Ƙungiyarka","Yan Ẹgbẹ́ Rẹ","Họrọ Otu Gị","Choose your group"],
"Select your group":["Zaɓi ƙungiyarka","Yan ẹgbẹ́ rẹ","Họrọ otu gị","Choose your group"],
"New Registration — I'm registering myself":["Sabuwar Rajista — ni kaina nake rajista","Ìforúkọsílẹ̀ Tuntun — èmi fúnra mi ni mo ń forúkọ sílẹ̀","Ndebanye Aha Ọhụrụ — m na-edebanye aha m n'onwe m","New Registration — na me dey register myself"],
"Membership Status":["Matsayin zama mamba","Ipò ọmọ ẹgbẹ́","Ọnọdụ onye otu","Membership status"],
"Select membership status":["Zaɓi matsayin mamba","Yan ipò ọmọ ẹgbẹ́","Họrọ ọnọdụ onye otu","Choose membership status"],
"Volunteer":["Mai ba da kai","Olùyọ̀ǹda","Onye ọrụ afọ ofufo","Volunteer"],
"Active Member":["Mamba mai himma","Ọmọ ẹgbẹ́ tó ń kópa","Onye otu na-arụsi ọrụ ike","Active member"],
"Financial Contributor":["Mai bayar da gudummawar kuɗi","Olùdáwó","Onye na-enye onyinye ego","Person wey dey contribute money"],
"A little more about you":["Ƙarin bayani game da kai","Díẹ̀ sí i nípa rẹ","Ntakịrị ihe ọzọ gbasara gị","Small more about you"],
"This helps us make sure every community is represented. It stays private.":["Wannan yana taimaka mana mu tabbatar da cewa kowace al’umma tana da wakilci. Zai kasance sirri.","Èyí ń ràn wá lọ́wọ́ láti rí i dájú pé gbogbo àdúgbò ní aṣojú. Àṣírí ni yóò jẹ́.","Nke a na-enyere anyị aka ịhụ na obodo ọ bụla nwere onye nnọchite anya. Ọ ga-anọ na nzuzo.","This one dey help us make sure say every community get representation. E go remain private."],
"Gender":["Jinsi","Akọ tàbí Abo","Okike","Gender"],
"Select gender":["Zaɓi jinsi","Yan akọ tàbí abo","Họrọ okike","Choose gender"],
"Male":["Namiji","Ọkùnrin","Nwoke","Man"],
"Female":["Mace","Obìnrin","Nwanyị","Woman"],
"Marital Status":["Matsayin aure","Ipò ìgbéyàwó","Ọnọdụ alụmdi na nwunye","Marriage status"],
"Select marital status":["Zaɓi matsayin aure","Yan ipò ìgbéyàwó","Họrọ ọnọdụ alụmdi na nwunye","Choose marriage status"],
"Single":["Ban yi aure ba","Àpọ́n","Alụbeghị m","Single"],
"Married":["Na yi aure","Mo ti ṣègbéyàwó","Alụọla m","Married"],
"Age Group":["Rukunin shekaru","Ọjọ́-orí","Ọgbọ afọ","Age group"],
"Select age group":["Zaɓi rukunin shekaru","Yan ọjọ́-orí rẹ","Họrọ ọgbọ afọ","Choose age group"],
"Above 70":["Sama da 70","Ju 70 lọ","Karịrị 70","Pass 70"],
"Religion":["Addini","Ẹ̀sìn","Okpukpe","Religion"],
"Select religion":["Zaɓi addini","Yan ẹ̀sìn","Họrọ okpukpe","Choose religion"],
"Christian":["Kirista","Kristẹni","Onye Kraịst","Christian"],
"Muslim":["Musulmi","Mùsùlùmí","Onye Alakụba","Muslim"],
"Traditional":["Addinin gargajiya","Ẹ̀sìn ìbílẹ̀","Okpukpe ọdịnala","Traditional"],
"Others":["Wasu","Àwọn mìíràn","Ndị ọzọ","Others"],
"Occupation / Status":["Sana’a / Matsayi","Iṣẹ́ / Ipò","Ọrụ / Ọnọdụ","Work / Status"],
"Select your status":["Zaɓi matsayinka","Yan ipò rẹ","Họrọ ọnọdụ gị","Choose your status"],
"Civil Servant":["Ma’aikacin gwamnati","Òṣìṣẹ́ ìjọba","Onye ọrụ gọọmentị","Civil servant"],
"Business/Professional":["Ɗan kasuwa / Ƙwararre","Oníṣòwò / Akọ́ṣẹ́mọṣẹ́","Onye azụmahịa / Ọkachamara","Business / Professional"],
"Artisan":["Mai sana’ar hannu","Oníṣẹ́ ọwọ́","Onye ọrụ aka","Artisan (handwork)"],
"Farmer":["Manomi","Àgbẹ̀","Onye ọrụ ugbo","Farmer"],
"Small Scale Business / Self-Employed":["Ƙaramar sana’a / Aikin kai","Òwò kékeré / Iṣẹ́ ara-ẹni","Obere azụmahịa / Onye were onwe ya n'ọrụ","Small business / Self-employed"],
"Market Woman":["Matar kasuwa","Ìyá ọlọ́jà","Nwanyị ahịa","Market woman"],
"Road Transport Worker":["Ma’aikacin sufurin hanya","Òṣìṣẹ́ ìrìnnà ojú ọ̀nà","Onye ọrụ njem okporo ụzọ","Transport worker"],
"Unemployed":["Ba ni da aiki","Kò ní iṣẹ́","Enweghị ọrụ","No work"],
"Student":["Ɗalibi","Akẹ́kọ̀ọ́","Nwa akwụkwọ","Student"],
"Gospel Minister":["Mai wa’azin bishara","Ìránṣẹ́ Ìhìnrere","Onye ozi ọma","Gospel minister"],
"Imam":["Liman","Ìmámù","Imam","Imam"],
"Ethnic Group":["Ƙabila","Ẹ̀yà","Agbụrụ","Tribe"],
"e.g. Yoruba, Igbo, Hausa, Ijaw...":["misali Hausa, Yoruba, Igbo, Ijaw...","àpẹẹrẹ Yorùbá, Igbo, Hausa, Ijaw...","dịka Igbo, Yoruba, Hausa, Ijaw...","like Yoruba, Igbo, Hausa, Ijaw..."],
"Digital Skills":["Ƙwarewar fasahar zamani","Ìmọ̀ ẹ̀rọ ayélujára","Nka dijitalụ","Phone and computer skills"],
"Select level":["Zaɓi mataki","Yan ìpele","Họrọ ọkwa","Choose level"],
"High":["Babba","Gíga","Elu","High"],
"Average":["Matsakaici","Àárín","Etiti","Average"],
"None":["Babu","Kò sí","Ọ dịghị","None"],
"Mobilization Skills":["Ƙwarewar tara jama’a","Ìmọ̀ kíkó èèyàn jọ","Nka ịchịkọta ndị mmadụ","Mobilisation skills"],
"Why do you want to join FixNaija?":["Me ya sa kake son shiga FixNaija?","Kí ló dé tí o fẹ́ darapọ̀ mọ́ FixNaija?","Gịnị kpatara i ji chọọ isonye na FixNaija?","Why you wan join FixNaija?"],
"Tell us briefly why you want to be part of the movement...":["Faɗa mana a taƙaice dalilin da yasa kake son kasancewa cikin ƙungiyar...","Sọ fún wa ní ṣókí ìdí tí o fi fẹ́ wà nínú ẹgbẹ́ yìí...","Gwa anyị nkenke ihe mere i ji chọọ ịbụ akụkụ nke òtù a...","Tell us small why you wan dey inside the movement..."],
"I agree that FixNaija Movement may store the details above — including my support for the movement and any religion or ethnic group I have shared — and contact me by phone, WhatsApp or email about the movement. I can withdraw at any time. Read our":["Na yarda FixNaija Movement ta adana bayanan da ke sama — har da goyon bayana ga ƙungiyar da duk wani addini ko ƙabila da na bayar — kuma ta tuntuɓe ni ta waya, WhatsApp ko imel game da ƙungiyar. Zan iya janyewa a kowane lokaci. Karanta","Mo gbà pé FixNaija Movement lè tọ́jú àwọn àlàyé òkè yìí — pẹ̀lú àtìlẹ́yìn mi fún ẹgbẹ́ náà àti ẹ̀sìn tàbí ẹ̀yà tí mo ti sọ — kí wọ́n sì kàn sí mi lórí fóònù, WhatsApp tàbí ímeèlì nípa ẹgbẹ́ náà. Mo lè yọwọ́ nígbàkigbà. Ka","Ekwenyere m ka FixNaija Movement chekwaa nkọwa ndị dị n'elu — gụnyere nkwado m maka òtù a na okpukpe ma ọ bụ agbụrụ ọ bụla m kwuru — ma kpọtụrụ m site na ekwentị, WhatsApp ma ọ bụ email gbasara òtù a. Enwere m ike ịkwụsị oge ọ bụla. Gụọ","I agree make FixNaija Movement keep the details wey dey up — including say I support the movement and any religion or tribe wey I share — and make dem contact me by phone, WhatsApp or email about the movement. I fit comot anytime. Read our"],
"Privacy Policy":["Manufar Sirri","Ìlànà Àṣírí","Iwu Nzuzo","Privacy Policy"],
"and":["da","àti","na","and"],
"Terms of Use":["Sharuɗɗan Amfani","Àwọn Òfin Lílò","Usoro Ojiji","Terms of Use"],
"Complete Registration":["Kammala Rajista","Parí Ìforúkọsílẹ̀","Mezue Ndebanye Aha","Finish Registration"],
"Submitting...":["Ana aikawa...","À ń fi ránṣẹ́...","A na-ezipụ ya...","E dey send..."],
"You're In!":["Ka shiga!","O ti wọlé!","Ị banyela!","You don enter!"],
"Welcome to the FixNaija Movement. Your community coordinator will be in touch shortly via WhatsApp.":["Barka da zuwa ƙungiyar FixNaija. Jami’in yankinku zai tuntuɓe ka nan ba da jimawa ba ta WhatsApp.","Káàbọ̀ sí FixNaija Movement. Olùṣètò àdúgbò rẹ yóò kàn sí ọ láìpẹ́ lórí WhatsApp.","Nnọọ na FixNaija Movement. Onye nhazi obodo gị ga-akpọtụrụ gị n'oge na-adịghị anya site na WhatsApp.","Welcome to FixNaija Movement. Your community coordinator go reach you soon for WhatsApp."],
"Invite friends on WhatsApp":["Gayyaci abokai ta WhatsApp","Pe àwọn ọ̀rẹ́ lórí WhatsApp","Kpọọ ndị enyi na WhatsApp","Invite your friends for WhatsApp"],
"Join the FixNaija channel":["Shiga tashar FixNaija","Darapọ̀ mọ́ ìkànnì FixNaija","Sonye na chanel FixNaija","Join the FixNaija channel"],
"Protect your polling unit":["Kare rumfar zaɓenka","Dáàbò bo ibùdó ìdìbò rẹ","Chekwaa ebe ntuli aka gị","Protect your polling unit"],
"Back to home":["Koma shafin farko","Padà sí ojú-ìwé àkọ́kọ́","Laghachi n'ụlọ","Go back home"],
"Why register":["Me yasa za ka yi rajista","Kí ló dé tí o fi yẹ kí o forúkọ sílẹ̀","Ihe mere i ji kwesị idebanye aha","Why you go register"],
"Your ward. Your polling unit.":["Mazaɓarka. Rumfar zaɓenka.","Wọ́ọ̀dù rẹ. Ibùdó ìdìbò rẹ.","Wọọdụ gị. Ebe ntuli aka gị.","Your ward. Your polling unit."],
"Your voice.":["Muryarka.","Ohùn rẹ.","Olu gị.","Your voice."],
"Meet your organisers":["Haɗu da masu tsarawa","Pàdé àwọn olùṣètò rẹ","Zute ndị nhazi gị","Meet your organisers"],
"A coordinator from your LGA will reach out on WhatsApp.":["Jami’i daga Ƙaramar Hukumarka zai tuntuɓe ka ta WhatsApp.","Olùṣètò láti Ìjọba Ìbílẹ̀ rẹ yóò kàn sí ọ lórí WhatsApp.","Onye nhazi si LGA gị ga-akpọtụrụ gị na WhatsApp.","Coordinator from your LGA go reach you for WhatsApp."],
"Get action alerts":["Samu sanarwar ayyuka","Gba ìkìlọ̀ ìgbésẹ̀","Nweta ọkwa ihe a ga-eme","Get action alerts"],
"Town halls, PVC drives and events near you.":["Taruka, gangamin karɓar PVC da abubuwan da ke kusa da kai.","Ìpàdé ìlú, ìpolongo PVC àti ètò tó wà nítòsí rẹ.","Nzukọ obodo, mkpọsa PVC na mmemme dị nso gị.","Town hall meeting, PVC drive and events wey dey near you."],
"Protect the vote":["Kare ƙuri’a","Dáàbò bo ìbò","Chekwaa votu","Protect the vote"],
"Stand with your polling unit on election day.":["Tsaya tare da rumfar zaɓenka ranar zaɓe.","Dúró ti ibùdó ìdìbò rẹ ní ọjọ́ ìdìbò.","Guzoro ebe ntuli aka gị n'ụbọchị ntuli aka.","Stand with your polling unit for election day."],
"days to the presidential election":["kwanaki zuwa zaɓen shugaban ƙasa","ọjọ́ sí ìdìbò ààrẹ","ụbọchị fọdụrụ tupu ntuli aka onye isi ala","days remain for presidential election"],
"Nigerians registered so far":["’yan Najeriya da suka yi rajista zuwa yanzu","ọmọ Nàìjíríà tí wọ́n ti forúkọ sílẹ̀ báyìí","ndị Naịjirịa debanyelarị aha ugbu a","Naija people don register so far"],
"🔒 Your details are private and never sold.":["🔒 Bayananka sirri ne kuma ba za a taɓa sayar da su ba.","🔒 Àṣírí ni àwọn àlàyé rẹ, a kò sì ní tà wọ́n láé.","🔒 Nkọwa gị dị na nzuzo, a gaghị ere ha ere.","🔒 Your details dey private, nobody go sell am."],
"How we protect your data":["Yadda muke kare bayananka","Bí a ṣe ń dáàbò bo àlàyé rẹ","Otú anyị si echekwa data gị","How we dey protect your data"],
"Adebayo · For President":["Adebayo · Shugaban Ƙasa","Adebayo · Ààrẹ","Adebayo · Onye isi ala","Adebayo · For President"],
"Bugaje · For Vice President":["Bugaje · Mataimakin Shugaban Ƙasa","Bugaje · Igbá-kejì Ààrẹ","Bugaje · Osote onye isi ala","Bugaje · For Vice President"],
"Ready to submit ✓":["A shirye don aikawa ✓","Ó ti ṣetán láti fi ránṣẹ́ ✓","Ọ dịla njikere izipu ✓","E don ready to send ✓"],
"This phone number is already registered.":["An riga an yi rajista da wannan lambar waya.","A ti forúkọ sílẹ̀ pẹ̀lú nọ́ńbà fóònù yìí tẹ́lẹ̀.","E debanyelarị aha jiri nọmba ekwentị a.","Dem don register with this phone number before."],
"If that was you, you’re already in — no need to register again. Registering someone else? Please use":["Idan kai ne, ka riga ka shiga — babu buƙatar sake rajista. Kana yi wa wani rajista? Don Allah yi amfani da lambar wayarsa ta kansa.","Bí ìwọ ni, o ti wọlé tẹ́lẹ̀ — kò sí ìdí láti tún forúkọ sílẹ̀. Ṣé o ń forúkọ ẹlòmíràn sílẹ̀? Jọ̀wọ́ lo nọ́ńbà fóònù tirẹ̀.","Ọ bụrụ na ọ bụ gị, ị banyelarị — ọ dịghị mkpa idebanye aha ọzọ. Ị na-edebanye aha onye ọzọ? Biko jiri nọmba ekwentị nke ya.","If na you, you don already enter — no need to register again. You dey register another person? Abeg use the person own phone number."],
"their own":["","","",""],
"phone number.":["","","",""],
"Making your card…":["Ana shirya katinka…","À ń ṣe káàdì rẹ…","A na-akwado kaadị gị…","We dey make your card…"],
"Tell your people.":["Faɗa wa mutanenka.","Sọ fún àwọn èèyàn rẹ.","Gwa ndị gị.","Tell your people."],
"Your personal card is ready — post it on WhatsApp Status, Facebook or Instagram and bring three friends along.":["Katinka na musamman ya shirya — saka shi a WhatsApp Status, Facebook ko Instagram ka kawo abokai uku.","Káàdì tìrẹ ti ṣetán — fi sí WhatsApp Status, Facebook tàbí Instagram kí o sì mú ọ̀rẹ́ mẹ́ta wá.","Kaadị gị dị njikere — tinye ya na WhatsApp Status, Facebook ma ọ bụ Instagram ma kpọta ndị enyi atọ.","Your own card don ready — post am for WhatsApp Status, Facebook or Instagram and carry three friends come."],
"Show my first name on the card":["Nuna sunana na farko a kan katin","Fi orúkọ àkọ́kọ́ mi hàn lórí káàdì náà","Gosi aha mbụ m na kaadị ahụ","Show my first name for the card"],
"Share my card":["Raba katina","Pín káàdì mi","Kesaa kaadị m","Share my card"],
"Download":["Sauke","Ṣe ìgbàsílẹ̀","Budata","Download"],
"Saved to your downloads — attach it in WhatsApp or your Status.":["An adana shi a cikin abubuwan da ka sauke — haɗa shi a WhatsApp ko Status ɗinka.","Ó ti wà nínú àwọn ìgbàsílẹ̀ rẹ — so ó mọ́ WhatsApp tàbí Status rẹ.","Echekwala ya n'ihe ndị ị budatara — tinye ya na WhatsApp ma ọ bụ Status gị.","E don save for your downloads — attach am for WhatsApp or your Status."],
"You were invited by":["Wanda ya gayyace ka:","Ẹni tó pè ọ́:","Onye kpọrọ gị:","Na this person invite you:"],
"— Loading wards... —":["— Ana loda mazaɓu... —","— À ń gbé àwọn wọ́ọ̀dù jáde... —","— A na-ebudata wọọdụ... —","— Ward dey load... —"],
"— Could not load wards —":["— An kasa loda mazaɓu —","— A kò lè gbé àwọn wọ́ọ̀dù jáde —","— Enweghị ike ibudata wọọdụ —","— Ward no gree load —"],
"— Loading... —":["— Ana lodawa... —","— Ó ń bọ̀... —","— Ọ na-ebudata... —","— E dey load... —"],
"— Could not load polling units —":["— An kasa loda rumfunan zaɓe —","— A kò lè gbé àwọn ibùdó ìdìbò jáde —","— Enweghị ike ibudata ebe ntuli aka —","— Polling units no gree load —"],
"— Could not load LGAs —":["— An kasa loda Ƙananan Hukumomi —","— A kò lè gbé àwọn Ìjọba Ìbílẹ̀ jáde —","— Enweghị ike ibudata LGA —","— LGA no gree load —"],
"Something went wrong submitting your registration. Please check your connection and try again.":["Wani abu ya faru wajen aika rajistarka. Don Allah duba hanyar sadarwarka ka sake gwadawa.","Nǹkan kan ṣẹlẹ̀ nígbà tí a ń fi ìforúkọsílẹ̀ rẹ ránṣẹ́. Jọ̀wọ́ ṣàyẹ̀wò ìsopọ̀ íntánẹ́ẹ̀tì rẹ kí o sì tún gbìyànjú.","Ihe adịghị mma mere mgbe a na-ezipu ndebanye aha gị. Biko lelee njikọ ịntanetị gị ma nwaa ọzọ.","Something no work well as we dey send your registration. Abeg check your network and try again."],
"Please take a second to check your details, then press the button again.":["Don Allah ka ɗan duba bayananka, sannan ka sake danna maɓallin.","Jọ̀wọ́ fi ìṣẹ́jú kan ṣàyẹ̀wò àwọn àlàyé rẹ, lẹ́yìn náà tún tẹ bọ́tìnnì náà.","Biko were ntakịrị oge lelee nkọwa gị, wee pịa bọtịnụ ahụ ọzọ.","Abeg take small time check your details, then press the button again."],
"The security check did not go through. Please wait a moment and press the button again.":["Binciken tsaro bai yi nasara ba. Don Allah ka jira ɗan lokaci ka sake danna maɓallin.","Àyẹ̀wò ààbò kò yọrí sí rere. Jọ̀wọ́ dúró díẹ̀ kí o sì tún tẹ bọ́tìnnì náà.","Nlele nchekwa agaghị nke ọma. Biko chere ntakịrị wee pịa bọtịnụ ahụ ọzọ.","The security check no pass. Abeg wait small and press the button again."]
  };
  var RX=[["^(\\d+)% complete$", {"ha": "an kammala $1%", "yo": "$1% ti parí", "ig": "$1% emechaala", "pcm": "$1% don complete"}]];
  var KEY='fx_lang';
  var NOTO='https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap';
  var root=document.querySelector('[data-i18n]')||document.querySelector('main');
  if(!root)return;

  var cur='en', src=new WeakMap(), srcA=new WeakMap(), btns=[];
  var ATTRS=['placeholder','aria-label'];

  function norm(s){return String(s).replace(/\s+/g,' ').trim();}
  function tr(en,l){
    if(!COL.hasOwnProperty(l))return null;
    var k=norm(en); if(!k)return null;
    if(D.hasOwnProperty(k))return D[k][COL[l]];
    for(var i=0;i<RX.length;i++){var re=new RegExp(RX[i][0]); if(re.test(k))return k.replace(re,RX[i][1][l]);}
    return null;
  }
  function skip(el){return !el||!!el.closest('script,style,noscript,textarea,[data-no-i18n]');}

  /* one text node: remember its English, show the translation */
  function doText(n){
    var p=n.parentNode; if(!p||p.nodeType!==1||skip(p))return;
    var v=n.nodeValue, r=src.get(n), mine=!!r&&r[1]===v, en=mine?r[0]:v;
    var t=tr(en,cur);
    if(t==null){ if(mine&&v!==en)n.nodeValue=en; src.delete(n); return; }
    if(!mine&&p.tagName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',p.value); // keep the sent value English
    var m=/^(\s*)[\s\S]*?(\s*)$/.exec(en), out=m[1]+t+m[2];
    src.set(n,[en,out]); if(v!==out)n.nodeValue=out;
  }
  function doAttrs(el){
    for(var i=0;i<ATTRS.length;i++){
      var a=ATTRS[i]; if(!el.hasAttribute(a))continue;
      var rec=srcA.get(el)||{}, v=el.getAttribute(a), r=rec[a], mine=!!r&&r[1]===v, en=mine?r[0]:v;
      var t=tr(en,cur);
      if(t==null){ if(mine&&v!==en)el.setAttribute(a,en); delete rec[a]; }
      else{ rec[a]=[en,t]; if(v!==t)el.setAttribute(a,t); }
      srcA.set(el,rec);
    }
  }
  function walk(node){
    if(node.nodeType===3){doText(node);return;}
    if(node.nodeType!==1||skip(node))return;
    doAttrs(node);
    var w=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:function(x){
      return (x.nodeType===1&&skip(x))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    var x; while((x=w.nextNode())){ if(x.nodeType===3)doText(x); else doAttrs(x); }
  }

  /* text the page writes later (progress, buttons, messages, share card) */
  var mo=new MutationObserver(function(list){
    if(cur==='en')return;
    for(var i=0;i<list.length;i++){
      var r=list[i];
      if(r.type==='characterData')doText(r.target);
      else if(r.type==='attributes'){ if(!skip(r.target))doAttrs(r.target); }
      else for(var j=0;j<r.addedNodes.length;j++)walk(r.addedNodes[j]);
    }
  });
  mo.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});

  /* pop-up messages from the page */
  var nativeAlert=window.alert;
  window.alert=function(msg){var t=tr(msg,cur);return nativeAlert.call(window,t==null?msg:t);};

  function loadNoto(){
    if(document.getElementById('fxNoto'))return;
    var l=document.createElement('link');l.id='fxNoto';l.rel='stylesheet';l.href=NOTO;document.head.appendChild(l);
  }
  function setLang(l,save){
    if(!COL.hasOwnProperty(l))l='en';
    cur=l; document.documentElement.lang=l;
    if(l==='ha'||l==='yo'||l==='ig')loadNoto();
    walk(root);
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-l')===l?'true':'false');});
    if(save){
      try{localStorage.setItem(KEY,l);}catch(_){}
      try{var u=new URL(location.href); if(l==='en')u.searchParams.delete('lang'); else u.searchParams.set('lang',l); history.replaceState(history.state,'',u.href);}catch(_){}
    }
  }

  /* the language chips */
  var css=document.createElement('style');
  css.textContent=
    '.fx-langs{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 20px}'+
    '.fx-langs .gl{font-size:1rem;line-height:1;margin-right:2px}'+
    '.fx-langs button{font-family:var(--text,sans-serif);font-weight:600;font-size:.8rem;line-height:1;padding:9px 13px;border-radius:999px;border:1px solid var(--rule-2,#d6d1c4);background:#fff;color:var(--ink,#0d140f);cursor:pointer;transition:border-color .2s,background .2s}'+
    '.fx-langs button:hover{border-color:var(--green,#00663a)}'+
    '.fx-langs button[aria-pressed="true"]{background:var(--green,#00663a);border-color:var(--green,#00663a);color:#fff}'+
    '@media(max-width:420px){.fx-langs{gap:5px}.fx-langs .gl{display:none}.fx-langs button{padding:8px 10px;font-size:.76rem}}'+
    'html:lang(ha),html:lang(yo),html:lang(ig){--text:"Noto Sans","Poppins","Segoe UI",Arial,sans-serif;--display:"Archivo","Noto Sans","Helvetica Neue",Arial,sans-serif}';
  document.head.appendChild(css);
  var nav=document.createElement('nav');
  nav.className='fx-langs'; nav.setAttribute('data-no-i18n',''); nav.setAttribute('aria-label','Language · Harshe · Èdè · Asụsụ');
  nav.innerHTML='<span class="gl" aria-hidden="true">🌐</span>'+LANGS.map(function(x){
    return '<button type="button" lang="'+x[0]+'" data-l="'+x[0]+'" aria-pressed="false">'+x[1]+'</button>';}).join('');
  var host=document.querySelector('[data-i18n-bar]')||root.querySelector('.rg-hero')||root;
  host.insertBefore(nav,host.firstChild);
  btns=[].slice.call(nav.querySelectorAll('button'));
  btns.forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-l'),true);});});

  /* start: ?lang= wins, then the saved choice */
  var start='en';
  try{
    var q=(new URLSearchParams(location.search).get('lang')||'').toLowerCase();
    if(q==='en'||COL.hasOwnProperty(q)){start=q;localStorage.setItem(KEY,q);}
    else{var s=localStorage.getItem(KEY); if(s&&COL.hasOwnProperty(s))start=s;}
  }catch(_){}
  setLang(start,false);
})();
