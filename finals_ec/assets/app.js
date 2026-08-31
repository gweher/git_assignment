/* =====================================================
   Státní zkouška — Ekonomika a management
   Shared JavaScript
   ===================================================== */

/* ── Tabs ── */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.tab;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = tabGroup.closest('.tab-container') || document;
        container.querySelectorAll('.tab-panel').forEach(p => {
          p.classList.toggle('active', p.id === panel);
        });
      });
    });
  });
}

/* ── Reveal buttons ── */
function initReveal() {
  document.querySelectorAll('[data-reveal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.reveal;
      const target = document.getElementById(targetId);
      if (!target) return;
      target.classList.remove('hidden');
      target.classList.add('revealed');
      btn.style.display = 'none';
    });
  });
  document.querySelectorAll('[data-reveal-all]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.revealAll;
      document.querySelectorAll(`.reveal-group-${group}`).forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('revealed');
      });
      document.querySelectorAll(`[data-reveal-all="${group}"]`).forEach(b => b.style.display = 'none');
    });
  });
}

/* ── Reset reveal (for re-practice) ── */
function resetRecall() {
  document.querySelectorAll('.revealed').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('revealed');
  });
  document.querySelectorAll('[data-reveal], [data-reveal-all]').forEach(btn => {
    btn.style.display = '';
  });
}

/* ── Progress tracking (localStorage) ── */
const PROGRESS_KEY = 'szk_progress';
function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch { return {}; }
}
function setTopicStatus(topicId, status) {
  const p = getProgress();
  p[topicId] = { status, ts: Date.now() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
function getTopicStatus(topicId) {
  return (getProgress()[topicId] || {}).status || 'unseen';
}
function renderProgressDots() {
  document.querySelectorAll('.topic-card[data-topic]').forEach(card => {
    const id = card.dataset.topic;
    const status = getTopicStatus(id);
    const dot = card.querySelector('.status-dot');
    if (dot) { dot.className = 'status-dot ' + status; }
    const label = card.querySelector('.status-label');
    if (label) {
      label.textContent = status === 'done' ? 'Zvládnuto' : status === 'seen' ? 'Procvičeno' : 'Neprocvičeno';
    }
  });
}
function markCurrentTopic(status) {
  const topicId = document.body.dataset.topic;
  if (topicId) setTopicStatus(topicId, status);
}

/* ── Exam Simulation ── */
const TOPICS = [
  { id: '01', title: 'Chování spotřebitele a formování poptávky', file: 'lessons/01-spotritel.html' },
  { id: '02', title: 'Analýza nákladů a formování nabídky', file: 'lessons/02-naklady.html' },
  { id: '03', title: 'Firma v podmínkách dokonalé a nedokonalé konkurence', file: 'lessons/03-konkurence.html' },
  { id: '04', title: 'Trh kapitálu a investiční rozhodování', file: 'lessons/04-kapital.html' },
  { id: '05', title: 'Odvětvová struktura hospodářství', file: 'lessons/05-odvetvi.html' },
  { id: '06', title: 'Regulace hospodářské soutěže', file: 'lessons/06-soutez.html' },
  { id: '07', title: 'Bankovní produkty a služby', file: 'lessons/07-bankovni-produkty.html' },
  { id: '08', title: 'Banka jako podnik', file: 'lessons/08-banka-podnik.html' },
  { id: '09', title: 'Zásady účetnictví a účetní výkazy', file: 'lessons/09-ucetnictvi.html' },
  { id: '10', title: 'Manažerské účetnictví', file: 'lessons/10-manazerske-uctv.html' },
  { id: '11', title: 'Rozhodovací úlohy v manažerském účetnictví', file: 'lessons/11-rozhodovaci.html' },
  { id: '12', title: 'Finanční analýza a ukazatelé finanční analýzy', file: 'lessons/12-financni-analyza.html' },
  { id: '13', title: 'Krátkodobé a dlouhodobé financování', file: 'lessons/13-financovani.html' },
  { id: '14', title: 'Trh práce', file: 'lessons/14-trh-prace.html' },
  { id: '15', title: 'Hospodářská politika a makroekonomický produkt', file: 'lessons/15-hosp-politika.html' },
  { id: '16', title: 'Fiskální politika', file: 'lessons/16-fiskalni.html' },
  { id: '17', title: 'Daňová soustava ČR', file: 'lessons/17-dane.html' },
  { id: '18', title: 'Trh peněz a bankovní systém', file: 'lessons/18-penize.html' },
  { id: '19', title: 'Inflace a nezaměstnanost', file: 'lessons/19-inflace.html' },
  { id: '20', title: 'Měnový kurz, platební bilance, cenné papíry a kolektivní investování', file: 'lessons/20-kurz.html' },
];

function pickTwoRandom(arr) {
  const a = [...arr];
  const i1 = Math.floor(Math.random() * a.length);
  const t1 = a.splice(i1, 1)[0];
  const i2 = Math.floor(Math.random() * a.length);
  const t2 = a.splice(i2, 1)[0];
  return [t1, t2];
}

function initSimulation() {
  const btn = document.getElementById('sim-start');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const [t1, t2] = pickTwoRandom(TOPICS);
    const box = document.getElementById('sim-result');
    box.innerHTML = `
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:.8rem;">Vaše dnešní zkušební témata:</p>
      <div class="sim-topic">
        <div class="sim-topic-num">Téma A</div>
        <div class="sim-topic-title">${t1.title}</div>
        <div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">
          <a href="${t1.file}" class="reveal-btn" style="display:inline-block;width:auto;padding:.4rem .8rem;font-size:.82rem;text-decoration:none;">Blueprint</a>
          <a href="${t1.file}#recall" class="reveal-btn secondary" style="display:inline-block;width:auto;padding:.4rem .8rem;font-size:.82rem;text-decoration:none;">Recall Mode</a>
        </div>
      </div>
      <div class="sim-topic">
        <div class="sim-topic-num">Téma B</div>
        <div class="sim-topic-title">${t2.title}</div>
        <div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">
          <a href="${t2.file}" class="reveal-btn" style="display:inline-block;width:auto;padding:.4rem .8rem;font-size:.82rem;text-decoration:none;">Blueprint</a>
          <a href="${t2.file}#recall" class="reveal-btn secondary" style="display:inline-block;width:auto;padding:.4rem .8rem;font-size:.82rem;text-decoration:none;">Recall Mode</a>
        </div>
      </div>
      <p class="notice" style="margin-top:1rem;">💡 Postup: Zavři browser, mluv ~15 min ke každému tématu. Pak se vrať a ověř blueprint.</p>
    `;
    box.classList.remove('hidden');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initReveal();
  renderProgressDots();
  initSimulation();

  // Mark topic as seen when blueprint tab is viewed
  const seenBtn = document.getElementById('btn-mark-seen');
  const doneBtn = document.getElementById('btn-mark-done');
  if (seenBtn) seenBtn.addEventListener('click', () => { markCurrentTopic('seen'); seenBtn.textContent = '✓ Označeno jako procvičeno'; seenBtn.disabled = true; });
  if (doneBtn) doneBtn.addEventListener('click', () => { markCurrentTopic('done'); doneBtn.textContent = '✓ Označeno jako zvládnuto'; doneBtn.disabled = true; });

  // Reset recall button
  const resetBtn = document.getElementById('btn-reset-recall');
  if (resetBtn) resetBtn.addEventListener('click', resetRecall);

  // Hash-based tab navigation
  if (window.location.hash === '#recall') {
    const recallBtn = document.querySelector('[data-tab="recall"]');
    if (recallBtn) recallBtn.click();
  } else if (window.location.hash === '#memory') {
    const memBtn = document.querySelector('[data-tab="memory"]');
    if (memBtn) memBtn.click();
  }
});
