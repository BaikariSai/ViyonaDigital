/* ============================================================
   VIYONA DIGITAL — AI Chatbot
   Guided lead-collection chatbot with Anthropic API
   ============================================================ */

(function () {
  const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

  // ── State ─────────────────────────────────────────────────
  let chatOpen   = false;
  let tipShown   = false;
  let step       = 0;         // current flow step
  let lead       = {};        // collected lead data
  let waitingAI  = false;

  const STEPS = ['name','mobile','company','service','contact','message'];
  const SERVICE_OPTIONS = ['Website Development','Data Analytics','AI Chatbot','Digital Marketing','Other'];
  const CONTACT_OPTIONS = ['SMS','Call'];

  // ── Elements ──────────────────────────────────────────────
  const fabBtn    = document.getElementById('chatFabBtn');
  const tooltip   = document.getElementById('chatTooltip');
  const chatWin   = document.getElementById('chatWindow');
  const closeBtn  = document.getElementById('chatCloseBtn');
  const msgArea   = document.getElementById('chatMessages');
  const optArea   = document.getElementById('chatOptions');
  const inputEl   = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');

  // Show tooltip after 3s
  setTimeout(() => {
    if (!tipShown && !chatOpen) { tooltip.style.display = 'block'; tipShown = true; }
  }, 3000);

  // ── Toggle chat ───────────────────────────────────────────
  fabBtn.addEventListener('click', () => {
    chatOpen = !chatOpen;
    chatWin.classList.toggle('open', chatOpen);
    tooltip.style.display = 'none';
    fabBtn.textContent = chatOpen ? '✕' : '💬';
    if (chatOpen && msgArea.children.length === 0) startChat();
  });

  closeBtn.addEventListener('click', () => {
    chatOpen = false;
    chatWin.classList.remove('open');
    fabBtn.textContent = '💬';
  });

  // ── Send message ──────────────────────────────────────────
  sendBtn.addEventListener('click', handleUserInput);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserInput(); } });

  // ── Start chat ────────────────────────────────────────────
  function startChat() {
    step = 0;
    lead = {};
    showTyping();
    setTimeout(() => {
      removeTyping();
      addBotMsg("👋 Hi there! I'm <strong>Viya</strong>, your Viyona Digital assistant.<br>I'd love to help connect you with the right service. May I ask a few quick questions?");
      setTimeout(() => askStep(), 800);
    }, 900);
  }

  // ── Ask question for each step ────────────────────────────
  function askStep() {
    showTyping();
    const questions = {
      name:    "What's your <strong>full name</strong>? 😊",
      mobile:  "Great! What's your <strong>mobile number</strong>? (10-digit Indian number)",
      company: "What's your <strong>company or business name</strong>?",
      service: "Which <strong>service</strong> are you interested in?",
      contact: "How would you prefer us to <strong>contact you</strong>?",
      message: "Almost done! Any specific <strong>message or requirement</strong> you'd like to share?"
    };
    setTimeout(() => {
      removeTyping();
      addBotMsg(questions[STEPS[step]]);
      if (STEPS[step] === 'service') showOptions(SERVICE_OPTIONS);
      else if (STEPS[step] === 'contact') showOptions(CONTACT_OPTIONS);
      else { inputEl.placeholder = getPlaceholder(); inputEl.disabled = false; inputEl.focus(); }
    }, 700);
  }

  function getPlaceholder() {
    const ph = { name:'Your full name', mobile:'e.g. 9876543210', company:'Company or business name', message:'Type your message here...' };
    return ph[STEPS[step]] || 'Type here...';
  }

  // ── Handle user text input ────────────────────────────────
  function handleUserInput() {
    if (waitingAI) return;
    const val = inputEl.value.trim();
    if (!val) return;
    inputEl.value = '';
    addUserMsg(val);
    processAnswer(val);
  }

  // ── Handle option click ───────────────────────────────────
  function showOptions(opts) {
    clearOptions();
    inputEl.disabled = true;
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        addUserMsg(opt);
        clearOptions();
        inputEl.disabled = false;
        processAnswer(opt);
      });
      optArea.appendChild(btn);
    });
  }

  function clearOptions() { optArea.innerHTML = ''; }

  // ── Validate & process each step ─────────────────────────
  function processAnswer(val) {
    const curStep = STEPS[step];

    if (curStep === 'name') {
      if (val.length < 2) { showValidationError("Please enter your full name (at least 2 characters)."); return; }
      lead.name = val;
    }

    if (curStep === 'mobile') {
      const cleaned = val.replace(/\s/g, '');
      if (!/^[6789]\d{9}$/.test(cleaned)) {
        showValidationError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        return;
      }
      lead.mobile = cleaned;
    }

    if (curStep === 'company') {
      if (val.length < 2) { showValidationError("Please enter a valid company/business name."); return; }
      lead.company = val;
    }

    if (curStep === 'service') { lead.service = val; }
    if (curStep === 'contact') { lead.contact = val; }
    if (curStep === 'message') { lead.message = val; }

    step++;
    if (step < STEPS.length) {
      askStep();
    } else {
      finishCollection();
    }
  }

  // ── Validation error ──────────────────────────────────────
  function showValidationError(msg) {
    showTyping();
    setTimeout(() => {
      removeTyping();
      addBotMsg(`⚠️ ${msg}`);
      if (STEPS[step] === 'service') showOptions(SERVICE_OPTIONS);
      else if (STEPS[step] === 'contact') showOptions(CONTACT_OPTIONS);
      else { inputEl.disabled = false; inputEl.focus(); }
    }, 500);
  }

  // ── Finish & save lead ────────────────────────────────────
  function finishCollection() {
    const newLead = {
      id:      Date.now(),
      source:  'Chatbot',
      name:    lead.name,
      mobile:  lead.mobile,
      company: lead.company,
      service: lead.service,
      contact: lead.contact,
      message: lead.message,
      date:    new Date().toLocaleDateString('en-IN'),
      time:    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const leads = JSON.parse(localStorage.getItem('vd_leads') || '[]');
    leads.unshift(newLead);
    localStorage.setItem('vd_leads', JSON.stringify(leads));

    // Generate AI closing message
    generateClosingMessage(newLead);
  }

  async function generateClosingMessage(leadData) {
    waitingAI = true;
    showTyping();
    inputEl.disabled = true;

    const prompt = `You are Viya, a friendly chatbot for Viyona Digital, a digital agency. 
A potential client has just submitted their enquiry with these details:
- Name: ${leadData.name}
- Company: ${leadData.company}
- Service interested in: ${leadData.service}
- Preferred contact: ${leadData.contact}

Write a warm, encouraging 2–3 sentence closing message. Thank them by first name, confirm their enquiry is received, mention the service they're interested in, and say the team will contact them via their preferred method. Be friendly and professional. Do NOT use markdown.`;

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const msg = data.content?.[0]?.text || defaultClosing(leadData);
      removeTyping();
      addBotMsg(`✅ ${msg}`);
    } catch {
      removeTyping();
      addBotMsg(`✅ ${defaultClosing(leadData)}`);
    }

    waitingAI = false;
    inputEl.disabled = false;

    // Show restart option after 2s
    setTimeout(() => {
      addBotMsg("Would you like to enquire about something else?");
      showOptions(['Start over 🔄', 'No, thanks 👋']);
      optArea.querySelectorAll('.chat-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          clearOptions();
          if (btn.textContent.includes('Start')) startChat();
          else addBotMsg("Thanks for chatting! Have a great day! ☀️");
        }, { once: true });
      });
    }, 2000);
  }

  function defaultClosing(l) {
    return `Thank you, ${l.name}! Your enquiry about ${l.service} has been received. Our team will reach out to you via ${l.contact} very soon. We look forward to working with ${l.company}!`;
  }

  // ── Chat UI helpers ───────────────────────────────────────
  function addBotMsg(html) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    wrap.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">${html}</div>
    `;
    msgArea.appendChild(wrap);
    scrollBottom();
  }

  function addUserMsg(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg user';
    wrap.innerHTML = `
      <div class="msg-bubble">${escHtml(text)}</div>
      <div class="msg-avatar" style="background:var(--orange-300);">👤</div>
    `;
    msgArea.appendChild(wrap);
    scrollBottom();
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    wrap.id = 'typingIndicator';
    wrap.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble" style="padding:12px 16px;">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
      </div>
    `;
    msgArea.appendChild(wrap);
    scrollBottom();
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  function scrollBottom() { msgArea.scrollTop = msgArea.scrollHeight; }
  function escHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

})();
