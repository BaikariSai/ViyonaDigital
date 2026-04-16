/* ============================================================
   VIYONA DIGITAL — Admin Panel JavaScript
   ============================================================ */

// ── Credentials (stored in localStorage for persistence) ────
const DEFAULT_PASSWORD = 'VDadmin56';
const CREDS_KEY        = 'vd_admin_creds';
const SESSION_KEY      = 'vd_admin_session';

function getCreds() {
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
  } else {
    alert("Login success");
    window.location.href = "dashboard.html";
  }
});

function saveCreds(creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

// ── DOM refs ─────────────────────────────────────────────────
const loginPage   = document.getElementById('login-page');
const adminShell  = document.getElementById('admin-shell');
const loginEmail  = document.getElementById('loginEmail');
const loginPass   = document.getElementById('loginPass');
const loginErr    = document.getElementById('loginError');
const loginBtn    = document.getElementById('loginBtn');

// Sidebar nav items
const navItems = document.querySelectorAll('.nav-item[data-panel]');
const panels   = document.querySelectorAll('.admin-panel');
const logoutBtn = document.getElementById('logoutBtn');

// ── Check existing session ────────────────────────────────────
if (sessionStorage.getItem(SESSION_KEY) === '1') {
  showAdmin();
}

// ── Login ─────────────────────────────────────────────────────
loginBtn.addEventListener('click', doLogin);
document.getElementById('loginForm').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const email = loginEmail.value.trim();
  const pass  = loginPass.value;
  const creds = getCreds();

  if (email === creds.email && pass === creds.password) {
    sessionStorage.setItem(SESSION_KEY, '1');
    loginErr.classList.remove('show');
    showAdmin();
  } else {
    loginErr.textContent = 'Invalid email or password. Please try again.';
    loginErr.classList.add('show');
    loginPass.value = '';
    loginPass.focus();
  }
}

function showAdmin() {
  loginPage.style.display  = 'none';
  adminShell.classList.add('show');
  switchPanel('leads');
  loadLeads();
  loadAboutAdmin();
}

// ── Logout ────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  adminShell.classList.remove('show');
  loginPage.style.display = 'flex';
  loginEmail.value = '';
  loginPass.value  = '';
});

// ── Panel switching ───────────────────────────────────────────
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const panel = item.dataset.panel;
    switchPanel(panel);
  });
});

function switchPanel(panelId) {
  panels.forEach(p => p.classList.toggle('active', p.id === `panel-${panelId}`));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.panel === panelId));

  // Refresh data on switch
  if (panelId === 'leads') loadLeads();
}

// ── LEADS PANEL ───────────────────────────────────────────────
function loadLeads() {
  const leads = JSON.parse(localStorage.getItem('vd_leads') || '[]');
  const tbody  = document.getElementById('leadsTableBody');
  const totalEl = document.getElementById('totalLeads');
  const formEl  = document.getElementById('formLeads');
  const chatEl  = document.getElementById('chatLeads');
  const todayEl = document.getElementById('todayLeads');

  const today = new Date().toLocaleDateString('en-IN');
  const formCount  = leads.filter(l => l.source === 'Form').length;
  const chatCount  = leads.filter(l => l.source === 'Chatbot').length;
  const todayCount = leads.filter(l => l.date === today).length;

  totalEl.textContent = leads.length;
  formEl.textContent  = formCount;
  chatEl.textContent  = chatCount;
  todayEl.textContent = todayCount;

  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="9">
        <div class="empty-state">
          <div class="empty-ico">📋</div>
          <p>No leads yet. Leads from the contact form and chatbot will appear here.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(l.name)}</td>
      <td>${esc(l.mobile)}</td>
      <td>${esc(l.company || '—')}</td>
      <td>${esc(l.service || '—')}</td>
      <td>${esc(l.contact || '—')}</td>
      <td>${esc(l.message || '—')}</td>
      <td>${esc(l.date)} ${esc(l.time || '')}</td>
      <td><span class="source-badge source-${l.source === 'Form' ? 'form' : 'chat'}">${esc(l.source)}</span></td>
    </tr>
  `).join('');
}

// ── Download leads as Excel ───────────────────────────────────
document.getElementById('downloadLeads').addEventListener('click', () => {
  const leads = JSON.parse(localStorage.getItem('vd_leads') || '[]');
  if (leads.length === 0) { alert('No leads to download.'); return; }

  // Use SheetJS
  const headers = ['#','Name','Mobile','Company','Service','Contact Type','Message','Date & Time','Source'];
  const rows = leads.map((l, i) => [
    i + 1,
    l.name, l.mobile, l.company || '', l.service || '', l.contact || '',
    l.message || '', `${l.date} ${l.time || ''}`, l.source
  ]);

  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [5,20,14,20,22,14,35,18,10].map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `ViyonaDigital_Leads_${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.xlsx`);
});

// ── ABOUT ADMIN PANEL ─────────────────────────────────────────
const ABOUT_KEY = 'vd_admin_about';

function loadAboutAdmin() {
  const data = JSON.parse(localStorage.getItem(ABOUT_KEY) || '{}');
  const fields = ['adminName','adminRole','adminPhone','adminEmail2','adminBio','adminCompany','adminLocation','adminLinkedIn'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && data[f]) el.value = data[f];
  });
  // Pre-fill email from creds
  const el = document.getElementById('adminEmail2');
  if (el && !el.value) el.value = getCreds().email;
}

document.getElementById('saveAboutBtn').addEventListener('click', () => {
  const fields = ['adminName','adminRole','adminPhone','adminEmail2','adminBio','adminCompany','adminLocation','adminLinkedIn'];
  const data = {};
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) data[f] = el.value.trim();
  });
  localStorage.setItem(ABOUT_KEY, JSON.stringify(data));
  showMsg('aboutMsg', 'Admin profile saved successfully!', 'success');
});

// ── EDITABLES PANEL ───────────────────────────────────────────
// Update Password
document.getElementById('updatePassBtn').addEventListener('click', () => {
  const cur  = document.getElementById('currentPass').value;
  const nw   = document.getElementById('newPass').value;
  const conf = document.getElementById('confirmPass').value;
  const creds = getCreds();

  if (cur !== creds.password) {
    showMsg('passMsg', 'Current password is incorrect.', 'error'); return;
  }
  if (nw.length < 6) {
    showMsg('passMsg', 'New password must be at least 6 characters.', 'error'); return;
  }
  if (nw !== conf) {
    showMsg('passMsg', 'New passwords do not match.', 'error'); return;
  }

  creds.password = nw;
  saveCreds(creds);
  showMsg('passMsg', 'Password updated successfully!', 'success');
  ['currentPass','newPass','confirmPass'].forEach(id => document.getElementById(id).value = '');
});

// Update Email
document.getElementById('updateEmailBtn').addEventListener('click', () => {
  const pass  = document.getElementById('emailConfirmPass').value;
  const newEm = document.getElementById('newEmail').value.trim();
  const creds = getCreds();

  if (pass !== creds.password) {
    showMsg('emailMsg', 'Password is incorrect.', 'error'); return;
  }
  if (!newEm.includes('@') || !newEm.includes('.')) {
    showMsg('emailMsg', 'Please enter a valid email address.', 'error'); return;
  }

  creds.email = newEm;
  saveCreds(creds);
  showMsg('emailMsg', 'Email updated successfully!', 'success');
  ['emailConfirmPass','newEmail'].forEach(id => document.getElementById(id).value = '');
});

// ── Clear all leads (admin only) ──────────────────────────────
document.getElementById('clearLeadsBtn')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to permanently delete ALL leads? This cannot be undone.')) {
    localStorage.removeItem('vd_leads');
    loadLeads();
  }
});

// ── Helpers ───────────────────────────────────────────────────
function showMsg(elId, text, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = `update-msg ${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function esc(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
