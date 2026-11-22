/* ===== ملف المشروبات =====
   لتعديل/إضافة مشروب: انسخ سطر وغيّر بياناته. الصورة في الحقل img (حط صورتك في images/drinks وغيّر المسار).
   opts = أسئلة الزبون:  {t:"spoons"} معالق سكر | {t:"choice"} اختيار واحد | {t:"multi"} اختيارات متعددة
   في choices: "نص" أو ["نص", زيادة_السعر] */
const SUGAR = ["ساده","مظبوط","زيادة","سوبر زيادة"];
const SPOON_Q = {t:"spoons", label:"عدد معالق السكر", def:2};
const MILK_Q = {t:"choice", label:"اللبن", choices:["عادي (من غير لبن)","باللبن"]};
const DRINKS = [
 {id:"fiori",   name:"فيوري",  cat:"باردة", price:30, badge:"بارد",  desc:"مشروب فواكه ساقع ومنعش.", img:"fuory plastic.jfif"},
 {id:"pepsi",   name:"بيبسي",  cat:"باردة", price:25, badge:"",      desc:"مشروب غازي بارد.",        img:"pepsi.jfif"},
 {id:"sprite",  name:"سبرايت", cat:"باردة", price:25, badge:"ليمون", desc:"سبرايت بطعم الليمون.",    img:"7up.jfif"},
 {id:"miranda", name:"ميرندا", cat:"باردة", price:25, badge:"برتقان",desc:"ميرندا برتقان باردة.",    img:"Merenda.jfif"},
 {id:"sting",   name:"ستنج",   cat:"باردة", price:25, badge:"طاقة",  desc:"مشروب طاقة بارد.",        img:"Sting Plastic.jfif"},
 {id:"twist",   name:"تويست",  cat:"باردة", price:25, badge:"نكهتين",desc:"تويست بالتوت أو ساده.",   img:"twist.jfif",
  opts:[{t:"choice", label:"النكهة", choices:["بالتوت","ساده"]}]},
 {id:"water",   name:"مياه معدنية", cat:"باردة", price:10, badge:"", desc:"مياه معدنية.", img:"water.jfif"},
 {id:"tea",     name:"شاي",    cat:"ساخنة", price:15, badge:"", desc:"شاي على ذوقك.",   img:"tea.jfif",    opts:[SPOON_Q]},
 {id:"helba",   name:"حلبة",   cat:"ساخنة", price:15, badge:"", desc:"حلبة ساخنة.",     img:"yanson.jfif",  opts:[SPOON_Q]},
 {id:"anise",   name:"ينسون",  cat:"ساخنة", price:15, badge:"", desc:"ينسون ساخن.",     img:"yanson.jfif",  opts:[SPOON_Q]},
 {id:"ginger",  name:"زنجبيل", cat:"ساخنة", price:15, badge:"", desc:"زنجبيل ساخن.",    img:"yanson.jfif", opts:[SPOON_Q]},
 {id:"coffee",  name:"قهوة",   cat:"ساخنة", price:25, badge:"", desc:"قهوة ساده 25 جنيه — باللبن 35 جنيه.", img:"coffe.jfif",
  opts:[{t:"choice", label:"السكر", choices:SUGAR, def:1}, {t:"choice", label:"اللبن", choices:[["عادي (من غير لبن)",0],["باللبن (+10)",10]]}]},
 {id:"nescafe", name:"نسكافيه",cat:"ساخنة", price:25, badge:"", desc:"نسكافيه بلبن أو من غير لبن.", img:"nescafe.jfif",
  opts:[{t:"choice", label:"السكر", choices:SUGAR, def:1}, MILK_Q]},
 {id:"iced",    name:"آيس كوفي — عادي", cat:"آيس", price:60, badge:"60 EGP", desc:"آيس كوفي بالحجم العادي.", img:"ice coffe.jfif",
  opts:[{t:"choice", label:"السكر", choices:SUGAR, def:1}]},
 {id:"iced-big",name:"آيس كوفي — كبير", cat:"آيس", price:80, badge:"80 EGP", desc:"حجم كبير مع آيس كريم وصوص شوكولاتة.", img:"big iceCoffe.jfif",
  opts:[{t:"choice", label:"السكر", choices:SUGAR, def:1}]}
];
