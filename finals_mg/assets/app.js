/* ===== SZZk Management — App Logic ===== */

const STORAGE_KEY = 'szzk-progress';

// ── Progress persistence ──
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function setTopicStatus(id, status) {
  const p = loadProgress();
  p[id] = status;
  saveProgress(p);
  renderProgressBadges();
}
function getTopicStatus(id) {
  return loadProgress()[id] || 'pending';
}
function resetProgress() {
  if (confirm('Opravdu resetovat veškerý pokrok?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ── Dashboard progress badges ──
function renderProgressBadges() {
  const p = loadProgress();
  document.querySelectorAll('[data-topic-id]').forEach(el => {
    const id = el.dataset.topicId;
    const badge = el.querySelector('.badge');
    if (!badge) return;
    const status = p[id] || 'pending';
    badge.className = 'badge badge--' + (status === 'done' ? 'done' : status === 'inprogress' ? 'inprogress' : 'pending');
    badge.textContent = status === 'done' ? 'Zvládnuto' : status === 'inprogress' ? 'Procvičuji' : 'Nezačato';
  });
  updateOverallProgress();
}

function updateOverallProgress() {
  const p = loadProgress();
  const done = Object.values(p).filter(v => v === 'done').length;
  const total = 18;
  const bar = document.querySelector('.progress-bar-fill');
  if (bar) bar.style.width = Math.round(done / total * 100) + '%';
  const countEl = document.querySelector('#progress-count');
  if (countEl) countEl.textContent = done;
}

// ── Quiz cards ──
function initQuiz() {
  document.querySelectorAll('.quiz-card').forEach(card => {
    const qEl = card.querySelector('.quiz-card__q');
    let aEl = card.querySelector('.quiz-card__a');
    if (!qEl) return;

    // Support data-answer attribute (agent-generated format)
    if (card.dataset.answer && aEl && !aEl.textContent.trim()) {
      aEl.innerHTML = card.dataset.answer.replace(/\n/g, '<br>') +
        `<div class="quiz-card__actions">
          <button class="btn btn--small btn--success quiz-card__action" data-result="correct">✓ Věděl/a</button>
          <button class="btn btn--small quiz-card__action" style="background:var(--accent-light);color:var(--accent)" data-result="incorrect">✗ Nevěděl/a</button>
        </div>`;
    }

    // Add reveal hint to question if no button present
    if (!card.querySelector('.quiz-card__reveal-btn')) {
      const hint = document.createElement('span');
      hint.className = 'quiz-card__reveal-btn';
      hint.textContent = 'Odkrýt';
      hint.style.cssText = 'font-size:.72rem;color:var(--muted);background:var(--tag-bg);border:none;border-radius:3px;padding:.15rem .45rem;cursor:pointer;margin-left:.5rem;white-space:nowrap;flex-shrink:0';
      qEl.appendChild(hint);
    }

    if (!aEl) return;
    const btn = card.querySelector('.quiz-card__reveal-btn');

    const toggle = () => {
      const open = aEl.classList.toggle('open');
      if (btn) btn.textContent = open ? 'Skrýt' : 'Odkrýt';
    };
    qEl.addEventListener('click', toggle);
    if (btn) btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });

    card.querySelectorAll('.quiz-card__action').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const result = b.dataset.result;
        card.classList.remove('quiz-card--correct', 'quiz-card--incorrect');
        if (result === 'correct') card.classList.add('quiz-card--correct');
        if (result === 'incorrect') card.classList.add('quiz-card--incorrect');
      });
    });
  });
}

// ── Follow-up toggle ──
function initFollowUps() {
  document.querySelectorAll('.follow-up-q').forEach(q => {
    q.addEventListener('click', () => {
      const a = q.nextElementSibling;
      const open = a.classList.toggle('open');
      q.classList.toggle('open', open);
    });
  });
}

// ── Section collapse ──
function initSectionBlocks() {
  document.querySelectorAll('.section-block__header').forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      const hidden = body.style.display === 'none';
      body.style.display = hidden ? '' : 'none';
      h.querySelector('.section-block__toggle').textContent = hidden ? '▲' : '▼';
    });
  });
}

// ── Recall mode ──
function initRecallMode() {
  const btn = document.getElementById('recall-toggle-btn');
  if (!btn) return;
  const topicId = document.body.dataset.topicId;
  btn.addEventListener('click', () => {
    const active = document.body.classList.toggle('recall-mode');
    btn.textContent = active ? '📖 Zobrazit odpověď' : '🎯 Recall mód';
    if (topicId && active) setTopicStatus(topicId, 'inprogress');
  });
}

// ── Mark as mastered ──
function initMasteredBtn() {
  const btn = document.getElementById('mastered-btn');
  if (!btn) return;
  const topicId = document.body.dataset.topicId;
  btn.addEventListener('click', () => {
    setTopicStatus(topicId, 'done');
    btn.textContent = '✓ Zvládnuto';
    btn.disabled = true;
  });
  const status = getTopicStatus(topicId);
  if (status === 'done') { btn.textContent = '✓ Zvládnuto'; btn.disabled = true; }
}

// ── Timer ──
let timerInterval = null;
function startTimer(minutes, displayId) {
  const el = document.getElementById(displayId);
  if (!el) return;
  let seconds = minutes * 60;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds--;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (seconds <= 120) el.classList.add('warning');
    if (seconds <= 0) { clearInterval(timerInterval); el.textContent = '0:00'; }
  }, 1000);
  el.textContent = `${minutes}:00`;
  el.classList.remove('warning');
}
function stopTimer() { clearInterval(timerInterval); }

// ── Simulation ──
const TOPICS = [
  { id: 't01', num: 1, name: 'Východiska a základní principy managementu', file: 'topics/01-principy-managementu.html',
    triggers: 'Taylor → Mayo → Fayol → 5 funkcí → úrovně → USA/Japonsko → TQM → systém' },
  { id: 't02', num: 2, name: 'Plánování a strategické řízení organizace', file: 'topics/02-planovani-strategie.html',
    triggers: 'poslání → vize → SWOT → STEP → BSC → Porter → BCG → strategie → krizový mgmt' },
  { id: 't03', num: 3, name: 'Organizování', file: 'topics/03-organizovani.html',
    triggers: 'byrokratická → adaptivní → strmá → plochá → liniová → funkční → maticová → delegování → rozpětí' },
  { id: 't04', num: 4, name: 'Řízení lidských zdrojů', file: 'topics/04-rizeni-lz.html',
    triggers: 'analýza potřeb → získávání → výběr → adaptace → vzdělávání → hodnocení → odměňování → zánik PP' },
  { id: 't05', num: 5, name: 'Vedení a motivace zaměstnanců', file: 'topics/05-vedeni-motivace.html',
    triggers: 'styly vedení → mřížka → Fiedler → McGregor X/Y → Maslow → Herzberg → McClelland → EI' },
  { id: 't06', num: 6, name: 'Kontrola', file: 'topics/06-kontrola.html',
    triggers: 'druhy → formy → efektivita → audit → rozpočet → bod zvratu → finanční ukazatele → soudy' },
  { id: 't07', num: 7, name: 'Firemní kultura a komunikace', file: 'topics/07-firemni-kultura.html',
    triggers: 'kultura → úrovně → identita → image → komunikační proces → neverbální → verbální → rétorika → internet' },
  { id: 't08', num: 8, name: 'Rozhodování a informace', file: 'topics/08-rozhodovani-informace.html',
    triggers: 'typy rozhodnutí → prostředí → IT → rozhodovací proces → skupinové → org. učení → právní úprava' },
  { id: 't09', num: 9, name: 'Podnikání a podnikatelská odpovědnost', file: 'topics/09-podnikani.html',
    triggers: 'podnikatel → záměr → OR → korporace → a.s. → s.r.o. → živnosti → ESG → CSR' },
  { id: 't10', num: 10, name: 'Základy českého soukromého práva', file: 'topics/10-soukrome-pravo.html',
    triggers: 'OZ → věcná práva → závazkové vztahy → odpovědnost → bezdůvodné obohacení → dědění → rodinné právo' },
  { id: 't11', num: 11, name: 'Základy českého veřejného práva', file: 'topics/11-verejne-pravo.html',
    triggers: 'dělba moci → Ústava → LZPS → státní správa → samospráva → trestní odpovědnost' },
  { id: 't12', num: 12, name: 'Moderní psychologické směry', file: 'topics/12-psychologicke-smery.html',
    triggers: 'behaviorismus → Skinner → psychoanalýza → Freud → kognitivní → humanistická → Maslow → manažerská aplikace' },
  { id: 't13', num: 13, name: 'Osobnost manažera', file: 'topics/13-osobnost-manazera.html',
    triggers: 'role → time management → Pareto → Eisenhower → temperament → inteligence → emoční dimenze → charakter' },
  { id: 't14', num: 14, name: 'Stres a jeho zvládání', file: 'topics/14-stres.html',
    triggers: 'homeostáza → stresor → GAS → Lazarus → kognitivní hodnocení → coping → prevence → civilizační nemoci' },
  { id: 't15', num: 15, name: 'Marketingové řízení', file: 'topics/15-marketingove-rizeni.html',
    triggers: 'pojetí → koncepce → strategický proces → plán → portfolio → SBU → makro/mikro → MIS → CRM → inovace' },
  { id: 't16', num: 16, name: 'Chování zákazníků', file: 'topics/16-chovani-zakazniku.html',
    triggers: 'B2C → B2B → nákupní proces → vlivy → typologie → výzkum → segmentace → pokrytí trhu' },
  { id: 't17', num: 17, name: 'Marketingový mix (tvorba a řízení)', file: 'topics/17-marketingovy-mix.html',
    triggers: '4P → produkt → životní cyklus → cena → cenové strategie → komunikační mix → distribuce → reklama' },
  { id: 't18', num: 18, name: 'Internetový marketing', file: 'topics/18-internetovy-marketing.html',
    triggers: 'e-commerce → SEM → SEO → PPC → sociální sítě → e-mail → virální → obsahový marketing' },
];

let simTopics = [];
let simStep = 0;
let simTopicIdx = 0;

function startSimulation() {
  const shuffled = [...TOPICS].sort(() => Math.random() - .5);
  simTopics = shuffled.slice(0, 2);
  simTopicIdx = 0;
  simStep = 0;
  renderSimTopic();
  document.getElementById('sim-start')?.classList.add('hidden');
  document.getElementById('sim-area')?.classList.remove('hidden');
}

function renderSimTopic() {
  const t = simTopics[simTopicIdx];
  if (!t) return;
  const area = document.getElementById('sim-area');
  if (!area) return;

  area.innerHTML = `
    <div class="sim-topic">
      <div class="sim-topic__label">Téma ${simTopicIdx + 1} z 2</div>
      <div class="sim-topic__name">${t.num}. ${t.name}</div>
      <div class="sim-topic__triggers text-small">Memory triggers: ${t.triggers}</div>
    </div>
    <div class="callout callout--info mb-2">Přemyslete si strukturu odpovědi a mluvte ~15 minut. Pak odkrývejte kroky.</div>
    <div style="display:flex;gap:.6rem;align-items:center;margin-bottom:1rem;">
      <button class="btn btn--primary" onclick="startTimer(15,'sim-timer')">▶ Start 15 min</button>
      <button class="btn btn--secondary btn--small" onclick="stopTimer()">⏹ Stop</button>
      <div class="timer-display" id="sim-timer" style="font-size:1.6rem;padding:.2rem .5rem;">15:00</div>
    </div>
    <div class="sim-reveal-block" id="sim-reveals">
      <button class="btn btn--outline mt-1" onclick="revealSimStep('struktura')">Odkrýt strukturu odpovědi</button>
      <div class="sim-reveal-section" id="rev-struktura">
        <h4>Struktura odpovědi</h4>
        <p><em>Otevřete <a href="${t.file}" target="_blank">stránku tématu</a> pro kompletní blueprint.</em></p>
      </div>
      <button class="btn btn--outline mt-1" onclick="revealSimStep('mustsay')" style="margin-left:.5rem">Odkrýt co musím říct</button>
      <div class="sim-reveal-section" id="rev-mustsay">
        <h4>Co musím říct — klíčové body</h4>
        <p><em>Viz sekce „Co musím říct" na <a href="${t.file}" target="_blank">stránce tématu</a>.</em></p>
      </div>
      <button class="btn btn--outline mt-1" onclick="revealSimStep('followups')" style="margin-left:.5rem">Doplňující otázky</button>
      <div class="sim-reveal-section" id="rev-followups">
        <h4>Možné doplňující otázky</h4>
        <p><em>Viz sekce „Možné doplňující otázky" na <a href="${t.file}" target="_blank">stránce tématu</a>.</em></p>
      </div>
    </div>
    ${simTopicIdx < 1
      ? `<button class="btn btn--primary mt-3" onclick="nextSimTopic()">Další téma →</button>`
      : `<button class="btn btn--success mt-3" onclick="resetSim()">✓ Simulace dokončena — Zkusit znovu</button>`
    }
  `;
}

function revealSimStep(id) {
  document.getElementById('rev-' + id)?.classList.add('visible');
}
function nextSimTopic() {
  simTopicIdx++;
  renderSimTopic();
}
function resetSim() {
  document.getElementById('sim-start')?.classList.remove('hidden');
  document.getElementById('sim-area')?.classList.add('hidden');
}

// ── Init on page load ──
document.addEventListener('DOMContentLoaded', () => {
  initQuiz();
  initFollowUps();
  initSectionBlocks();
  initRecallMode();
  initMasteredBtn();
  renderProgressBadges();
});
