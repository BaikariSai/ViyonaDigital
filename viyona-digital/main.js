import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 replace with your real values
const SUPABASE_URL = "https://sowtktxjkrwratqgfgkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvd3RrdHhqa3J3cmF0cWdmZ2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTI1MzQsImV4cCI6MjA5MTY4ODUzNH0.REY-XdgXAJjZXzHLt2T2qLILkCRkTcckj54DfJx3MN8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  if (!form) {
    console.error("❌ contactForm not found");
    return;
  }

  console.log("✅ Supabase form connected");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ DIRECT value reading (no FormData bugs)
    const name = form.querySelector('[name="name"]').value.trim();
    const mobile = form.querySelector('[name="mobile"]').value.trim();
    const company = form.querySelector('[name="company"]').value.trim();
    const service = form.querySelector('[name="service"]').value;
    const contact = form.querySelector('[name="contact"]:checked')?.value || "";
    const message = form.querySelector('[name="message"]').value.trim();

    console.log("Submitting:", { name, mobile, company, service, contact, message });

    if (!name || !mobile || !service || !contact) {
      alert("Please fill all required fields");
      return;
    }

    const { error } = await supabase.from("leads").insert([
      {
        name,
        mobile,
        company,
        service,
        preferred_contact: contact,
        message
      }
    ]);

    if (error) {
      console.error("❌ Supabase error:", error);
      alert("Submission failed");
    } else {
      alert("✅ Message sent successfully");
      form.reset();
    }
  });
});
// ── Navbar ──────────────────────────────────────────────────
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  highlightNav();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('show');
});

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('show');
  });
});

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(s => {
    const top    = s.offsetTop;
    const height = s.offsetHeight;
    const id     = s.getAttribute('id');
    const links  = document.querySelectorAll(`.nav-links a[href="#${id}"], .mobile-nav a[href="#${id}"]`);
    links.forEach(l => l.classList.toggle('active', scrollY >= top && scrollY < top + height));
  });
}
highlightNav();

// ── Scroll Reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Service Modals ────────────────────────────────────────────
const modalData = {
  web: {
    icon: '🌐',
    title: 'Website Development',
    content: `
      <p>We design and develop fast, modern, and fully responsive websites that represent your brand with excellence. From landing pages to full-scale web applications, our team delivers pixel-perfect results.</p>
      <p><strong>What's included:</strong></p>
      <ul>
        <li>Custom UI/UX design tailored to your brand</li>
        <li>Fully responsive across all devices & screen sizes</li>
        <li>SEO-optimised structure & meta setup</li>
        <li>Fast-loading performance (Core Web Vitals)</li>
        <li>CMS integration (WordPress, Webflow, custom)</li>
        <li>E-commerce capabilities (if required)</li>
        <li>3 rounds of design revisions</li>
        <li>1 month post-launch support</li>
      </ul>
      <br>
      <p>Whether you're a startup needing your first website or an established brand requiring a redesign, we've got you covered.</p>
    `
  },
  analytics: {
    icon: '📊',
    title: 'Data Analytics',
    content: `
      <p>Turn raw data into actionable insights. Our data analytics services help you understand your customers, optimise operations, and make smarter decisions backed by numbers.</p>
      <p><strong>Our capabilities include:</strong></p>
      <ul>
        <li>Business intelligence dashboards (Power BI, Tableau, Looker)</li>
        <li>Customer behaviour & funnel analysis</li>
        <li>Marketing attribution & ROI tracking</li>
        <li>Data pipeline setup and automation</li>
        <li>Predictive analytics & trend forecasting</li>
        <li>Custom reporting for stakeholders</li>
        <li>Google Analytics 4 & Meta Pixel setup</li>
        <li>Monthly data review & strategy sessions</li>
      </ul>
      <br>
      <p>Stop guessing — start growing with data-driven strategies that actually work.</p>
    `
  },
  chatbot: {
    icon: '🤖',
    title: 'AI Chatbot Solutions',
    content: `
      <p>Deploy intelligent AI chatbots that work 24/7 to engage visitors, qualify leads, and provide instant support — all without adding headcount.</p>
      <p><strong>Our AI Chatbot services include:</strong></p>
      <ul>
        <li>Custom GPT-powered chatbot development</li>
        <li>Lead qualification & capture automation</li>
        <li>Seamless CRM integration</li>
        <li>Multi-platform deployment (website, WhatsApp, Instagram)</li>
        <li>Natural language understanding & intent recognition</li>
        <li>Escalation to human agents when needed</li>
        <li>Conversation analytics & optimisation</li>
        <li>Ongoing training & model improvement</li>
      </ul>
      <br>
      <p>Let AI handle repetitive queries while your team focuses on high-value conversations.</p>
    `
  }
};

let activeModal = null;

function openModal(type) {
  if (activeModal) closeModal(activeModal);
  const overlay = document.getElementById(`modal-${type}`);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  activeModal = type;
}

function closeModal(type) {
  const overlay = document.getElementById(`modal-${type}`);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  if (activeModal === type) activeModal = null;
}

// Build modals dynamically
Object.entries(modalData).forEach(([type, data]) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = `modal-${type}`;
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('${type}')">✕</button>
      <div class="modal-icon">${data.icon}</div>
      <h2>${data.title}</h2>
      ${data.content}
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(type); });
  document.body.appendChild(overlay);
});

// ESC key closes modal
document.addEventListener('keydown', e => { if (e.key === 'Escape' && activeModal) closeModal(activeModal); });

// ── Testimonials Carousel ─────────────────────────────────────
const reviews = [
  { name: 'Rajan Mehta', role: 'CEO, NexaTech Solutions', rating: 5, text: 'Viyona Digital completely transformed our online presence. The website they built for us loads incredibly fast and our leads have increased by 40% within the first month alone. Exceptional team!' },
  { name: 'Priya Sharma', role: 'Founder, StyleNest Boutique', rating: 5, text: 'Their AI chatbot has been a game-changer for our business. It handles customer queries round the clock and we have not missed a single lead since deployment. Worth every rupee invested.' },
  { name: 'Karan Nair', role: 'Marketing Head, BlueWave Logistics', rating: 5, text: 'The data analytics dashboard they set up for us gave us crystal-clear visibility into our operations. We made three strategic decisions in the first week that cut our operational costs by 18%.' },
  { name: 'Divya Patel', role: 'Director, GreenGrow Farms', rating: 5, text: 'From the very first call, Viyona Digital was professional, attentive, and genuinely invested in our growth. The website is stunning and the SEO work has pushed us to the first page of Google.' },
  { name: 'Arjun Reddy', role: 'Co-Founder, UrbanBite Foods', rating: 5, text: 'We came to Viyona with just a vague idea and they turned it into a full digital strategy. The team is knowledgeable, responsive, and truly cares about results. Highly recommend their services!' },
];

let currentReview = 0;
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');

function buildCarousel() {
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  reviews.forEach((r, i) => {
    const initials = r.name.split(' ').map(n => n[0]).join('');
    const stars = '⭐'.repeat(r.rating);
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-stars">${stars}</div>
      <p class="review-text"><span>${r.text}</span></p>
      <div class="reviewer">
        <div class="reviewer-avatar">${initials}</div>
        <div class="reviewer-info">
          <div class="name">${r.name}</div>
          <div class="role">${r.role}</div>
        </div>
      </div>
    `;
    track.appendChild(card);

    const dot = document.createElement('button');
    dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i+1}`);
    dot.addEventListener('click', () => goToReview(i));
    dotsContainer.appendChild(dot);
  });
  updateCarousel();
}

function updateCarousel() {
  track.style.transform = `translateX(-${currentReview * 100}%)`;
  document.querySelectorAll('.dot-btn').forEach((d, i) => d.classList.toggle('active', i === currentReview));
}

function goToReview(n) {
  currentReview = (n + reviews.length) % reviews.length;
  updateCarousel();
}

document.getElementById('carouselPrev').addEventListener('click', () => goToReview(currentReview - 1));
document.getElementById('carouselNext').addEventListener('click', () => goToReview(currentReview + 1));

// Auto-advance
setInterval(() => goToReview(currentReview + 1), 5000);

buildCarousel();

// ── Contact Form ──────────────────────────────────────────────


// ── Lead Storage ──────────────────────────────────────────────
function saveLead(lead) {
  const leads = JSON.parse(localStorage.getItem('vd_leads') || '[]');
  leads.unshift(lead);
  localStorage.setItem('vd_leads', JSON.stringify(leads));
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── WhatsApp ──────────────────────────────────────────────────
document.getElementById('whatsappBtn').addEventListener('click', () => {
  // ⚠️ Replace with your actual WhatsApp number (with country code, no +)
  const number = '+919666805317';
  const msg = encodeURIComponent('Hello Viyona Digital! I would like to know more about your services.');
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
});

// ── Admin redirect ────────────────────────────────────────────
document.getElementById('adminLoginBtn').addEventListener('click', () => {
  window.location.href = 'admin.html';
});

// ── Floating stats counter animation ─────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = +el.dataset.target;
    let count = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      count += step;
      if (count >= target) { count = target; clearInterval(timer); }
      el.textContent = Math.round(count) + (el.dataset.suffix || '');
    }, 18);
  });
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); } });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.home-stats');
if (statsEl) counterObserver.observe(statsEl);
