(() => {
  'use strict';
  const USERS_KEY = 'parisUsersV1';
  const LOCAL_SESSION_KEY = 'parisCurrentUser';
  const TEMP_SESSION_KEY = 'parisTempUser';
  const ITERATIONS = 210000;
  const $ = (id) => document.getElementById(id);
  let photoData = '';
  let toastTimer;

  const readUsers = () => {
    try {
      const value = JSON.parse(localStorage.getItem(USERS_KEY) || '{"users":[]}');
      return Array.isArray(value.users) ? value.users.filter(isUserRecord) : [];
    } catch { return []; }
  };
  const isSafePhoto = (photo) => !photo || (typeof photo === 'string' && photo.length <= 2200000 && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/.test(photo));
  const isUserRecord = (u) => u && typeof u.id === 'string' && typeof u.fullName === 'string' && typeof u.username === 'string' && typeof u.email === 'string' && typeof u.passwordHash === 'string' && typeof u.passwordSalt === 'string' && isSafePhoto(u.photo);
  const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify({ users, schemaVersion: 1 }));
  const normal = (s) => String(s || '').trim().toLowerCase();
  const escapeText = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const showToast = (message) => { const el = $('authToast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000); };
  const showView = (id) => { document.querySelectorAll('.auth-view').forEach(v => v.classList.toggle('active', v.id === id)); clearErrors(); window.scrollTo({top:0,behavior:'smooth'}); };
  const clearErrors = () => document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  const error = (id, message) => { $(id).textContent = message; };
  const bytesToHex = (bytes) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join('');
  const randomHex = (size=16) => { const b = crypto.getRandomValues(new Uint8Array(size)); return bytesToHex(b); };
  async function hashPassword(password, saltHex) {
    if (!crypto?.subtle) throw new Error('SECURE_CONTEXT_REQUIRED');
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(x => parseInt(x,16)));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);
    return bytesToHex(bits);
  }
  const setBusy = (button, busy, text) => { button.disabled = busy; button.querySelector('span').textContent = busy ? 'جاري التنفيذ...' : text; };
  const getCurrentId = () => sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY);
  const currentUser = () => readUsers().find(u => u.id === getCurrentId());
  const saveSession = (id, remember) => { sessionStorage.removeItem(LOCAL_SESSION_KEY); localStorage.removeItem(LOCAL_SESSION_KEY); (remember ? localStorage : sessionStorage).setItem(LOCAL_SESSION_KEY,id); };
  const formatDate = (date) => new Date(date).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});

  function renderProfile(user) {
    $('profileGreeting').textContent = (user.fullName.split(/\s+/)[0] || 'بيك') + '.';
    $('profileName').textContent = user.fullName;
    $('profileEmail').textContent = user.email;
    $('profileUsername').textContent = '@' + user.username;
    $('profileCreated').textContent = formatDate(user.createdAt);
    const avatarBox = $('profileAvatar'); avatarBox.replaceChildren();
    if (isSafePhoto(user.photo)) { const img=document.createElement('img'); img.src=user.photo; img.alt='الصورة الشخصية'; avatarBox.append(img); }
    else avatarBox.textContent = user.fullName.trim().charAt(0).toUpperCase() || 'P';
  }
  function updateAuthState() { const user = currentUser(); if (user) { renderProfile(user); showView('profileView'); } else showView('loginView'); }

  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  document.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', () => { const input = $(btn.dataset.toggle); input.type = input.type === 'password' ? 'text' : 'password'; }));

  $('profilePhoto').addEventListener('change', () => {
    const file = $('profilePhoto').files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { showToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP.'); $('profilePhoto').value=''; return; }
    if (file.size > 1.5 * 1024 * 1024) { showToast('حجم الصورة أكبر من 1.5MB.'); $('profilePhoto').value=''; return; }
    const reader = new FileReader();
    reader.onload = () => { photoData = String(reader.result); $('avatarPreview').innerHTML = `<img src="${photoData}" alt="معاينة الصورة">`; $('removePhoto').hidden = false; };
    reader.onerror = () => showToast('تعذر قراءة الصورة.');
    reader.readAsDataURL(file);
  });
  $('removePhoto').addEventListener('click', () => { photoData=''; $('profilePhoto').value=''; $('avatarPreview').textContent='P'; $('removePhoto').hidden=true; });

  $('registerPassword').addEventListener('input', () => {
    const p = $('registerPassword').value;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['ضعيفة جداً','ضعيفة','متوسطة','جيدة','قوية'];
    $('strengthBar').style.width = `${score*25}%`;
    $('strengthBar').style.background = score < 2 ? '#ff3048' : score < 4 ? '#f0a22e' : '#10b981';
    $('strengthText').textContent = labels[score];
  });

  $('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault(); clearErrors();
    const fullName=$('fullName').value.trim(), username=normal($('username').value), email=normal($('registerEmail').value), password=$('registerPassword').value, confirm=$('confirmPassword').value;
    let valid = true;
    if (fullName.length < 3) { error('fullNameError','اكتب الاسم بالكامل.'); valid=false; }
    if (!/^[a-z0-9_.-]{3,24}$/.test(username)) { error('usernameError','من 3 إلى 24 حرفاً إنجليزياً أو رقم أو _ أو . أو -.'); valid=false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error('registerEmailError','اكتب بريد إلكتروني صحيح.'); valid=false; }
    if (password.length < 8) { error('registerPasswordError','كلمة المرور لازم تكون 8 أحرف على الأقل.'); valid=false; }
    if (password !== confirm) { error('confirmPasswordError','كلمتا المرور غير متطابقتين.'); valid=false; }
    if (!$('acceptTerms').checked) { error('termsError','لازم توافق على شروط الاستخدام.'); valid=false; }
    const users=readUsers();
    if (users.some(u => normal(u.email)===email)) { error('registerEmailError','البريد الإلكتروني مستخدم بالفعل.'); valid=false; }
    if (users.some(u => normal(u.username)===username)) { error('usernameError','اسم المستخدم مستخدم بالفعل.'); valid=false; }
    if (!valid) return;
    const button=$('registerForm').querySelector('button[type="submit"]'); setBusy(button,true,'إنشاء الحساب');
    try {
      const salt=randomHex(); const passwordHash=await hashPassword(password,salt);
      const user={id:crypto.randomUUID(),fullName,username,email,passwordSalt:salt,passwordHash,passwordIterations:ITERATIONS,photo:photoData,createdAt:new Date().toISOString()};
      users.push(user); writeUsers(users); saveSession(user.id,true); showToast('تم إنشاء حسابك بنجاح ✨'); renderProfile(user); showView('profileView');
    } catch (e) { showToast(e.message==='SECURE_CONTEXT_REQUIRED'?'شغّل المشروع عبر localhost لتفعيل تشفير كلمة المرور.':'تعذر حفظ الحساب. قد تكون مساحة التخزين ممتلئة.'); }
    finally { setBusy(button,false,'إنشاء الحساب'); }
  });

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); clearErrors();
    const identity=normal($('loginIdentity').value), password=$('loginPassword').value;
    if (!identity) { error('loginIdentityError','اكتب البريد أو اسم المستخدم.'); return; }
    if (!password) { error('loginPasswordError','اكتب كلمة المرور.'); return; }
    const user=readUsers().find(u => normal(u.email)===identity || normal(u.username)===identity);
    const button=$('loginForm').querySelector('button[type="submit"]'); setBusy(button,true,'تسجيل الدخول');
    try {
      if (!user || await hashPassword(password,user.passwordSalt)!==user.passwordHash) { error('loginPasswordError','بيانات الدخول غير صحيحة.'); return; }
      saveSession(user.id,$('rememberMe').checked); renderProfile(user); showView('profileView'); showToast('أهلاً بيك في PARIS.');
    } catch { showToast('تعذر التحقق من كلمة المرور على هذا المتصفح.'); }
    finally { setBusy(button,false,'تسجيل الدخول'); }
  });

  $('forgotForm').addEventListener('submit', async (event) => {
    event.preventDefault(); clearErrors();
    const email=normal($('forgotEmail').value), password=$('newPassword').value;
    const user=readUsers().find(u=>normal(u.email)===email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error('forgotEmailError','اكتب بريد إلكتروني صحيح.'); return; }
    if (!user) { error('forgotEmailError','لا يوجد حساب بهذا البريد على هذا الجهاز.'); return; }
    if (password.length<8) { error('newPasswordError','كلمة المرور لازم تكون 8 أحرف على الأقل.'); return; }
    try { const salt=randomHex(); user.passwordSalt=salt; user.passwordHash=await hashPassword(password,salt); user.passwordIterations=ITERATIONS; writeUsers(readUsers().map(u=>u.id===user.id?user:u)); $('loginIdentity').value=email; $('loginPassword').value=''; showView('loginView'); showToast('تم تحديث كلمة المرور محلياً.'); }
    catch { showToast('تعذر تحديث كلمة المرور.'); }
  });

  $('logoutButton').addEventListener('click', () => { sessionStorage.removeItem(LOCAL_SESSION_KEY); localStorage.removeItem(LOCAL_SESSION_KEY); $('loginPassword').value=''; showView('loginView'); showToast('تم تسجيل الخروج.'); });
  $('exportUsers').addEventListener('click', () => {
    const data={app:'PARIS Gaming & Café',schemaVersion:1,exportedAt:new Date().toISOString(),users:readUsers()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='users.json'; a.click(); URL.revokeObjectURL(url); showToast('تم تجهيز ملف users.json.');
  });
  $('importUsers').addEventListener('change', async () => {
    const file=$('importUsers').files[0]; if (!file) return;
    if (file.size>5*1024*1024) { showToast('ملف JSON أكبر من الحد المسموح (5MB).'); $('importUsers').value=''; return; }
    try {
      const parsed=JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.users) || parsed.users.length>500 || !parsed.users.every(isUserRecord)) throw new Error('INVALID');
      const incoming=parsed.users; const emails=new Set(), names=new Set();
      for (const u of incoming) { const e=normal(u.email), n=normal(u.username); if (emails.has(e)||names.has(n)||!e||!n||!/^[a-f0-9]{64}$/i.test(u.passwordHash)||!/^[a-f0-9]{32}$/i.test(u.passwordSalt)||!u.id||!u.fullName||!u.createdAt) throw new Error('INVALID'); emails.add(e); names.add(n); }
      const merged=new Map(readUsers().map(u=>[u.id,u])); incoming.forEach(u=>merged.set(u.id,u));
      const all=[...merged.values()]; const allEmails=new Set(), allNames=new Set();
      for(const u of all){const e=normal(u.email),n=normal(u.username);if(allEmails.has(e)||allNames.has(n))throw new Error('DUPLICATE');allEmails.add(e);allNames.add(n);}
      writeUsers(all); showToast(`تم استيراد ${incoming.length} حساب بنجاح.`); updateAuthState();
    } catch(e) { showToast(e.message==='DUPLICATE'?'يوجد بريد أو اسم مستخدم مكرر بين البيانات.':'ملف JSON غير صالح أو غير متوافق.'); }
    finally { $('importUsers').value=''; }
  });
  $('termsInfo').addEventListener('click',()=>showToast('استخدام تجريبي محلي؛ لا توجد خدمة تحقق أو تخزين سحابي.'));
  updateAuthState();
})();
