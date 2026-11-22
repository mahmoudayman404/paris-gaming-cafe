/* ===== ملف الوافل والبان كيك =====
   نفس فكرة ملف المشروبات: عدّل السعر/الوصف/الصورة أو أضف سطر جديد. */
const SAUCES = ["شوكولاتة","شوكولاتة بيضا","مانجا","توت","خوخ","فراولة","كيوي"];
const SAUCE_Q = {t:"multi", label:"الصوصات", note:"أول صوص مجانًا — كل صوص إضافي +10 EGP", free:1, each:10, choices:SAUCES};
const DESSERTS = [
 {id:"waffle",  name:"وافل",         cat:"حلويات", price:40, badge:"الأكتر طلب", desc:"وافل مع أول صوص مجانًا، وكل صوص إضافي بـ10 جنيه.", img:"wafel.jfif",  opts:[SAUCE_Q]},
 {id:"pancake", name:"بان كيك صغير", cat:"حلويات", price:80, badge:"20 قطعة",    desc:"20 قطعة بان كيك صغيرة مع الصوصات اللي تختارها.",   img:"pancake.jfif", opts:[SAUCE_Q]}
];
