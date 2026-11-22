/* =========================================================
   PARIS — منطق الموقع. ملفات البيانات بجوار index.html:
   gaming.js  |  drinks.js  |  desserts.js
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA_NUMBER = "201033835451", CURRENCY = "EGP", CAFE = "الكافيه (الجلسات العامة)";
const SPOONS = ["من غير سكر","معلقة","معلقتين","3 معالق","4 معالق","5 معالق"];
const ALL = [...DRINKS, ...DESSERTS];
const locOf = x => x.name + (x.tag ? ` (${x.tag})` : "");
const find = id => ALL.find(x => x.id === id);
const choicesOf = o => (o.t === "spoons" ? SPOONS : o.choices).map(c => Array.isArray(c) ? c : [c, 0]);
// Treat browser storage as untrusted input; never trust persisted cart objects.
const safeReadCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("parisCart") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(x => x && typeof x.id === "string" && ALL.some(p => p.id === x.id))
      .map(x => {
        const product = ALL.find(p => p.id === x.id);
        const qty = Math.min(99, Math.max(1, Math.floor(Number(x.qty) || 1)));
        const price = Math.max(0, Math.min(100000, Number(x.price) || product.price));
        const details = Array.isArray(x.details) ? x.details.filter(v => typeof v === "string").slice(0, 12).map(v => v.slice(0, 160)) : [];
        return { key: `${product.id}|${details.join("|")}`, id: product.id, name: product.name, price, img: product.img, qty, details };
      });
  } catch { return []; }
};
let cart = safeReadCart();
let drinkCat = "الكل";
const formatEGP = n => `${Number(n).toLocaleString("en-US")} ${CURRENCY}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const saveCart = () => { try { localStorage.setItem("parisCart", JSON.stringify(cart)); } catch { showToast("تعذر حفظ العربة على هذا الجهاز"); } };

function showToast(m){$("#toastText").textContent=m;$("#toast").classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>$("#toast").classList.remove("show"),2200)}

const card = it => `<article class="menu-card" data-id="${it.id}"><div class="food-image"><img src="${it.img}" alt="${it.name}" loading="lazy">${it.badge?`<span class="badge">${it.badge}</span>`:""}</div><div class="food-body"><h3>${it.name}</h3><p>${it.desc}</p><div class="food-meta"><strong class="food-price">${formatEGP(it.price)}</strong><button class="add-button" data-add="${it.id}" aria-label="إضافة ${it.name}">+</button></div></div></article>`;
function renderDrinks(){
  const cats=["الكل",...new Set(DRINKS.map(x=>x.cat))];
  $("#drinkTabs").innerHTML=cats.map(c=>`<button class="${c===drinkCat?"active":""}" data-category="${c}">${c}</button>`).join("");
  $("#drinksGrid").innerHTML=DRINKS.filter(x=>drinkCat==="الكل"||x.cat===drinkCat).map(card).join("");
}
const renderDesserts=()=>{$("#dessertsGrid").innerHTML=DESSERTS.map(card).join("")};
function renderGaming(){
  $("#gamingGrid").innerHTML=Object.entries(GROUPS).map(([g,title])=>`<div class="subhead"><h3>${title}</h3></div><div class="gaming-grid">${GAMING.filter(x=>x.group===g).map((x,i)=>{const off=x.status==="unavailable";return `<article class="gaming-card ${off?"is-unavailable":""}"><div class="gaming-art" style="background-image:url('${x.img}')"></div><div class="gaming-content"><div class="gaming-topline"><h3>${x.name}${x.tag?`<span class="chip c${i%4}">${x.tag}</span>`:""}</h3><span class="status-pill ${off?"off":"on"}">${off?"غير متاح":"متاح"}</span></div><p>${x.desc}</p><div class="gaming-bottom"><b>Single ${formatEGP(x.price)}<br>Multi ${formatEGP(x.multi)}${x.game?`<br>Game ${formatEGP(x.game)}`:""}</b><button data-book="${x.id}" ${off?"disabled":""}>${off?"غير متاح":"احجز ↗"}</button></div></div></article>`}).join("")}</div>`).join("");
}
let where=null;
function fillLocations(){$("#bookingLocation").innerHTML=GAMING.map(x=>`<option>${locOf(x)}</option>`).join("")}
function setWhere(w){
  where=w;$$("#whereGrid button").forEach(b=>b.classList.toggle("active",b.dataset.where===w));
  const sel=$("#orderLocation"),list=w==="ps"?GAMING.filter(x=>x.group==="ps"):GAMING.filter(x=>x.group!=="ps");
  sel.hidden=!(w==="ps"||w==="play");if(!sel.hidden)sel.innerHTML=`<option value="">اختار ${w==="ps"?"الروم":"الترابيزة"}...</option>`+list.map(x=>`<option>${locOf(x)}</option>`).join("");
  $("#orderNote").hidden=w!=="out";$("#whereGrid").classList.remove("need");
}
function orderPlace(){
  if(!where)return null;
  if(where==="cafe")return CAFE;
  if(where==="out"){const n=$("#orderNote").value.trim();return "من بره (مش جوه PARIS)"+(n?` — ${n}`:"")}
  const v=$("#orderLocation").value;return v?`${where==="ps"?"في ":"عند "}${v}`:null;
}

const cartCount=()=>cart.reduce((s,i)=>s+i.qty,0), cartTotal=()=>cart.reduce((s,i)=>s+i.price*i.qty,0);
function addToCart(id,o={}){
  const it=find(id);if(!it)return;const details=o.details||[],key=id+"|"+details.join("|"),ex=cart.find(x=>x.key===key);
  if(ex)ex.qty++;else cart.push({key,id,name:it.name,price:o.price??it.price,img:it.img,qty:1,details});
  saveCart();renderCart();showToast(`${it.name} اتضافت للعربة ✓`);
}
function changeQty(key,d){const i=cart.find(x=>x.key===key);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.key!==key);saveCart();renderCart()}
function renderCart(){
  $("#cartCount").textContent=cartCount();$("#cartTotal").textContent=formatEGP(cartTotal());$("#cartEmpty").classList.toggle("show",!cart.length);
  $("#cartList").innerHTML=cart.map(i=>`<div class="cart-item"><div class="cart-thumb" style="background-image:url('${i.img}')"></div><div><h4>${escapeHTML(i.name)}</h4><small>${formatEGP(i.price)} للقطعة${i.details.length?`<br>${i.details.map(escapeHTML).join(" • ")}`:""}</small><div class="qty"><button data-minus="${encodeURIComponent(i.key)}">−</button><strong>${i.qty}</strong><button data-plus="${encodeURIComponent(i.key)}">+</button></div></div><strong>${formatEGP(i.price*i.qty)}</strong></div>`).join("");
}
function openCart(){$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.classList.add("locked")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.classList.remove("locked")}

function optHTML(o,i){
  const multi=o.t==="multi",def=o.def??(multi?-1:0);
  return `<div class="option-block"><label>${o.label}${o.note?`<small>${o.note}</small>`:""}</label><div class="choice-grid">${choicesOf(o).map(([t,p],j)=>`<label class="choice"><input type="${multi?"checkbox":"radio"}" name="o${i}" value="${j}" ${j===def?"checked":""}><span>${t}${p&&!t.includes("+")?` (+${p})`:""}</span></label>`).join("")}</div></div>`;
}
function calcProduct(it){
  const root=$("#productContent");let price=it.price;const details=[];
  (it.opts||[]).forEach((o,i)=>{
    const ch=choicesOf(o),picked=$$(`[name="o${i}"]:checked`,root).map(x=>ch[Number(x.value)]);
    if(o.t==="multi"){price+=Math.max(0,picked.length-(o.free||0))*(o.each||0);details.push(`${o.label}: ${picked.length?picked.map(c=>c[0]).join("، "):"بدون"}`)}
    else if(picked[0]){price+=picked[0][1];details.push(`${o.t==="spoons"?"السكر":o.label}: ${picked[0][0]}`)}
  });
  const note=$("#productNote",root)?.value.trim();if(note)details.push(`ملاحظة: ${note}`);
  return {price,details};
}
function updateProductPrice(){const it=find($("[data-modal-add]",$("#productContent"))?.dataset.modalAdd);if(it)$("#productLivePrice").textContent=formatEGP(calcProduct(it).price)}
function openProduct(id){
  const it=find(id);if(!it)return;
  $("#productContent").innerHTML=`<div class="product-view"><div class="product-art" style="background-image:url('${it.img}')"></div><div class="product-copy"><span class="section-number">${it.cat}</span><h2>${it.name}</h2><p>${it.desc}</p><strong class="product-price" id="productLivePrice">${formatEGP(it.price)}</strong><div class="product-options">${(it.opts||[]).map(optHTML).join("")}<div class="option-block"><label>ملاحظات <input id="productNote" placeholder="مثلاً: بدون إضافات..."></label></div></div><button class="btn btn-primary full" data-modal-add="${it.id}">إضافة للعربة <span>+</span></button></div></div>`;
  $("#productModal").classList.add("open");$("#productModal").setAttribute("aria-hidden","false");document.body.classList.add("locked");updateProductPrice();
}
function closeModal(){$$(".modal").forEach(m=>{m.classList.remove("open");m.setAttribute("aria-hidden","true")});document.body.classList.remove("locked")}

function openBooking(pre){
  const av=GAMING.filter(x=>x.status!=="unavailable");
  $("#bookingType").innerHTML=av.map(x=>`<option value="${x.id}" ${x.id===pre?"selected":""}>${locOf(x)} — Single ${formatEGP(x.price)} / Multi ${formatEGP(x.multi)} / ساعة</option>`).join("");
  $("#bookingLocation").value=locOf(av.find(x=>x.id===pre)||av[0]);
  $("#bookingGame").value="0"; updateBookingTotal();
  $("#bookingModal").classList.add("open");$("#bookingModal").setAttribute("aria-hidden","false");document.body.classList.add("locked");
}
function updateBookingTotal(){
  const item=GAMING.find(x=>x.id===$("#bookingType").value && x.status==="available")||GAMING.find(x=>x.status==="available");
  const hours=Math.min(3,Math.max(1,Number($("#bookingDuration").value)/60||1)),mode=$("#bookingMode")?.value||"عادي",rate=mode==="مالتي"?item.multi:item.price;
  const gameFee=item.game ? (Number($("#bookingGame")?.value)===1 ? item.game : 0) : 0;
  $("#gameOptionWrap").hidden=!item.game;
  const total=rate*hours+gameFee;
  $("#bookingTotal").textContent=formatEGP(total);return{item,hours,rate,total,mode,gameFee};
}
const whatsapp=t=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`,"_blank","noopener");
function makeReference(){const n=Number(localStorage.getItem("parisOrderNo")||1000)+1;localStorage.setItem("parisOrderNo",String(n));return `PARIS-${n}`}
function checkout(){
  if(!cart.length){showToast("العربة فاضية — ضيف حاجة الأول");return}
  const loc=orderPlace();if(!loc){$("#whereGrid").classList.add("need");showToast(where?"اختار الروم/الترابيزة الأول":"قولنا انت فين الأول");return}const ref=makeReference();
  const lines=cart.map(x=>`• ${x.name} × ${x.qty} = ${formatEGP(x.price*x.qty)}${x.details.length?`\n  ${x.details.join(" | ")}`:""}`).join("\n");
  whatsapp(`أهلاً PARIS 👋\n\nكود الطلب: ${ref}\nمكان الزبون: ${loc}\n\nالطلب:\n${lines}\n\nالإجمالي: ${formatEGP(cartTotal())}\n\nملاحظة: الطلب والحجز لا يتم تأكيدهما تلقائيًا، برجاء تأكيد التوفر عبر الواتساب.\nSent from PARIS website`);
}
function confirmBooking(){
  const {item,hours,rate,total,mode,gameFee}=updateBookingTotal(),loc=$("#bookingLocation").value,players=Math.min(10,Math.max(1,Math.floor(Number($("#bookingPlayers").value)||1))),notes=$("#bookingNotes").value.trim().slice(0,500)||"لا يوجد",ref=makeReference();
  whatsapp(`أهلاً PARIS 🎮\n\nطلب حجز مبدئي\nكود الطلب: ${ref}\n• التجربة: ${locOf(item)}\n• المكان: ${loc}\n• النظام: ${mode}\n• المدة: ${hours} ساعة\n• عدد اللاعبين: ${players}\n• سعر الساعة: ${formatEGP(rate)}\n• رسوم الجيم: ${formatEGP(gameFee)}\n• التكلفة التقديرية: ${formatEGP(total)}\n• ملاحظات: ${notes}\n\nبرجاء تأكيد توفر الجهاز/الترابيزة قبل بدء الحجز.\nSent from PARIS website`);
}

function initScroll(){const header=$("#header"),back=$("#backTop");addEventListener("scroll",()=>{header.classList.toggle("scrolled",scrollY>35);back.classList.toggle("show",scrollY>500)},{passive:true});back.onclick=()=>scrollTo({top:0,behavior:"smooth"})}
function initReveal(){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12}); $$(".reveal").forEach(el=>observer.observe(el))}
function initNavSpy(){const sections=["home","gaming","drinks","desserts","location"].map(id=>$("#"+id));const links=$$(".nav-links a");const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-35% 0px -55% 0px"});sections.forEach(s=>observer.observe(s))}
function initCanvas(){const canvas=$("#neonCanvas"),ctx=canvas.getContext("2d");let w,h,dots=[],mouse={x:-100,y:-100};function resize(){w=innerWidth;h=innerHeight;canvas.width=w*devicePixelRatio;canvas.height=h*devicePixelRatio;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);dots=Array.from({length:Math.min(70,Math.floor(w/18))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.6+.3}))}resize();addEventListener("resize",resize);addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});function draw(){ctx.clearRect(0,0,w,h);dots.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;const md=Math.hypot(p.x-mouse.x,p.y-mouse.y);if(md<150&&md>0){p.x+=(p.x-mouse.x)/md*.12;p.y+=(p.y-mouse.y)/md*.12}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=document.body.classList.contains("dark")?["rgba(212,175,55,.5)","rgba(255,255,255,.4)","rgba(43,140,255,.45)"][i%3]:(i%3===0?"rgba(255,49,81,.35)":"rgba(42,121,255,.25)");ctx.fill()});requestAnimationFrame(draw)}draw()}
function initCursor(){const glow=$("#cursorGlow");addEventListener("mousemove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"})}
function initTilt(){$$(".tilt-card").forEach(card=>{card.addEventListener("mousemove",e=>{if(innerWidth<900)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`rotateX(${y*-4}deg) rotateY(${x*5}deg) `});card.addEventListener("mouseleave",()=>card.style.transform="")});$$(".magnetic").forEach(el=>{el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});el.addEventListener("mouseleave",()=>el.style.transform="")})}
function initTheme(){if(localStorage.getItem("parisTheme")==="dark")document.body.classList.add("dark");$("#themeToggle").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("parisTheme",document.body.classList.contains("dark")?"dark":"light")}}

function bindEvents(){
  $("#drinkTabs").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;drinkCat=b.dataset.category;renderDrinks()});
  const grid=e=>{const c=e.target.closest(".menu-card");if(!c)return;const it=find(c.dataset.id);if(e.target.closest("[data-add]")&&!it.opts?.length)addToCart(it.id);else openProduct(it.id)};
  $("#drinksGrid").addEventListener("click",grid);$("#dessertsGrid").addEventListener("click",grid);
  $("#gamingGrid").addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(b&&!b.disabled)openBooking(b.dataset.book)});
  $("#cartButton").onclick=openCart;$$("[data-close-cart]").forEach(x=>x.addEventListener("click",closeCart));
  $("#cartList").addEventListener("click",e=>{const p=e.target.closest("[data-plus]"),m=e.target.closest("[data-minus]");if(p)changeQty(decodeURIComponent(p.dataset.plus),1);if(m)changeQty(decodeURIComponent(m.dataset.minus),-1)});
  $("#clearCart").onclick=()=>{cart=[];saveCart();renderCart();showToast("تم مسح العربة")};$("#checkout").onclick=checkout;$("#whereGrid").addEventListener("click",e=>{const b=e.target.closest("[data-where]");if(b)setWhere(b.dataset.where)});
  $$("[data-close-modal],[data-close-booking]").forEach(x=>x.addEventListener("click",closeModal));
  $("#productContent").addEventListener("change",updateProductPrice);
  $("#productContent").addEventListener("click",e=>{const b=e.target.closest("[data-modal-add]");if(!b)return;addToCart(b.dataset.modalAdd,calcProduct(find(b.dataset.modalAdd)));closeModal();openCart()});
  $("#quickBooking").onclick=()=>openBooking(GAMING.find(x=>x.status!=="unavailable").id);
  $("#bookingType").onchange=()=>{const it=GAMING.find(x=>x.id===$("#bookingType").value);if(it)$("#bookingLocation").value=locOf(it);updateBookingTotal()};
  $("#bookingDuration").onchange=updateBookingTotal;$("#bookingPlayers").oninput=updateBookingTotal;$("#bookingMode").addEventListener("change",updateBookingTotal);$("#bookingGame").addEventListener("change",updateBookingTotal);$("#confirmBooking").onclick=confirmBooking;
  $("#whatsappButton").onclick=()=>whatsapp("أهلاً PARIS 👋\nعايز أستفسر عن الخدمة.");$("#menuToggle").onclick=()=>$("#navLinks").classList.toggle("mobile-open");$$(".nav-links a").forEach(a=>a.onclick=()=>$("#navLinks").classList.remove("mobile-open"));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeModal()}});
}
window.addEventListener("load",()=>{setTimeout(()=>$("#loader").classList.add("hide"),650);$("#year").textContent=new Date().getFullYear();renderDrinks();renderDesserts();renderGaming();fillLocations();renderCart();initScroll();initReveal();initNavSpy();initCanvas();initCursor();initTilt();initTheme();bindEvents()});

// Keep the account entry point in sync with the local demo session.
function syncAccountButton(){
  const link=$("#accountButton"); if(!link)return;
  let id=sessionStorage.getItem("parisCurrentUser")||localStorage.getItem("parisCurrentUser");
  try{
    const users=JSON.parse(localStorage.getItem("parisUsersV1")||'{"users":[]}').users||[];
    const user=users.find(u=>u.id===id);
    if(user){
      const label=escapeHTML((user.fullName||"حسابي").split(/\s+/)[0]);
      link.replaceChildren();
      if(typeof user.photo==="string" && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/.test(user.photo)){
        const avatar=document.createElement("img");avatar.src=user.photo;avatar.alt="";link.append(avatar);
      }else link.append(document.createTextNode("♙ "));
      const name=document.createElement("span");name.textContent=(user.fullName||"حسابي").split(/\s+/)[0];link.append(name);
      link.setAttribute("aria-label","حساب "+label);
    }else{link.innerHTML='♙ <span>حسابي</span>';link.setAttribute("aria-label","حسابي")}
  }catch{link.innerHTML='♙ <span>حسابي</span>'}
}
window.addEventListener("storage",syncAccountButton);
window.addEventListener("load",syncAccountButton);
