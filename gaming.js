/* ===== ملف الألعاب: بلايستيشن / بلياردو / بينج بونج =====
   status: "available" أو "unavailable" (الجهاز المعطّل)
   name = الاسم الكبير | tag = الشارة اللي جنبه (PS1..) | img = الصورة */
const GROUPS = {ps:"PlayStation", billiard:"بلياردو", ping:"بينج بونج"};
const PS_DESC = "جهاز PlayStation — 40 جنيه Single / 60 جنيه Multi للساعة.";
const GAMING = [
 {id:"ps1", group:"ps", name:"روم واحد",  tag:"PS1", price:40, multi:60, status:"available",   desc:PS_DESC, img:"play.jfif"},
 {id:"ps2", group:"ps", name:"روم اتنين", tag:"PS2", price:40, multi:60, status:"available",   desc:PS_DESC, img:"play.jfif"},
 {id:"ps3", group:"ps", name:"روم تلاتة", tag:"PS3", price:40, multi:60, status:"available",   desc:PS_DESC, img:"play.jfif"},
 {id:"ps4", group:"ps", name:"روم أربعة", tag:"PS4", price:40, multi:60, status:"available",   desc:PS_DESC, img:"play.jfif"},
 {id:"ps5", group:"ps", name:"روم خمسة",  tag:"PS5", price:40, multi:60, status:"available",   desc:PS_DESC, img:"play.jfif"},
 {id:"ps6", group:"ps", name:"روم ستة",   tag:"PS6", price:40, multi:60, status:"available", desc:PS_DESC, img:"play.jfif"},
 {id:"billiard1", group:"billiard", name:"بلياردو 1", tag:"", price:40, multi:60, game:10, status:"available", desc:"ترابيزة بلياردو 1 — 40 Single / 60 Multi للساعة + 10 جنيه للجيم.", img:"pool.jfif"},
 {id:"billiard2", group:"billiard", name:"بلياردو 2", tag:"", price:60, multi:80, game:10, status:"available", desc:"ترابيزة بلياردو 2 — 60 Single / 80 Multi للساعة + 10 جنيه للجيم.", img:"pool.jfif"},
 {id:"ping", group:"ping", name:"بينج بونج", tag:"", price:40, multi:60, status:"available", desc:"ترابيزة بينج بونج — 40 Single / 60 Multi للساعة.", img:"ping.jfif"}
];
