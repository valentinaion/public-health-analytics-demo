import store from './state/store.js';
import { initTabs } from './components/tabs.js';
import { initAlerts } from './components/alerts.js';
import { initInterventions } from './components/interventions.js';
import { initCharts, initPopulationCharts, initSurveillanceCharts, initSocialCharts, updateCharts } from './components/charts.js';
import { initCopilotChat } from './components/copilotChat.js';
import { animateCounter } from './utils/counters.js';
import { formatRelativeTime } from './utils/formatters.js';
import { exportToCsv } from './utils/exportCsv.js';
import { openModal, closeModal, openDrawer, closeDrawer } from './components/modals.js';
import { showToast } from './components/toasts.js';
import { fetchPopulationKpis, fetchRiskStratification, fetchChronicDisease, fetchSdohCoverage, fetchInterventions, fetchPopulationTrends } from './api/healthData.js';
import { fetchOutbreaks, fetchSurveillanceTimeSeries, fetchEarlyWarningLog, fetchMapHotspots } from './api/surveillance.js';
import { fetchSocialCases, fetchWorkflowSteps, fetchCaseVolume, fetchCaseworkerCapacity, fetchProgramOutcomes } from './api/social.js';
import mockData from '../data/mockData.js';
import { renderOutbreakTrajectoryChart } from './components/charts.js';

const REFRESH_INTERVAL = 30000;
let lastRefreshTime = Date.now();
let secondsCounter = 0;
let outbreaksCache = [];
let socialCasesCache = [];
let workflowStepsCache = [];
let hotspotsCache = [];
let activeTooltip = null;

async function loadAllData() {
  const [kpis, risk, chronic, sdoh, interventions, trends,
         outbreaks, timeSeries, warnings, hotspots,
         socialCases, workflowSteps, caseVolume, capacity, outcomes] = await Promise.allSettled([
    fetchPopulationKpis(),
    fetchRiskStratification(),
    fetchChronicDisease(),
    fetchSdohCoverage(),
    fetchInterventions(),
    fetchPopulationTrends(),
    fetchOutbreaks(),
    fetchSurveillanceTimeSeries(),
    fetchEarlyWarningLog(),
    fetchMapHotspots(),
    fetchSocialCases(),
    fetchWorkflowSteps(),
    fetchCaseVolume(),
    fetchCaseworkerCapacity(),
    fetchProgramOutcomes()
  ]);

  return {
    kpis: kpis.status === 'fulfilled' ? kpis.value : mockData.kpis,
    risk: risk.status === 'fulfilled' ? risk.value : mockData.riskStratification,
    chronic: chronic.status === 'fulfilled' ? chronic.value : mockData.chronicDisease,
    sdoh: sdoh.status === 'fulfilled' ? sdoh.value : mockData.sdohCoverage,
    interventions: interventions.status === 'fulfilled' ? interventions.value : mockData.interventions,
    trends: trends.status === 'fulfilled' ? trends.value : mockData.populationTrends,
    outbreaks: outbreaks.status === 'fulfilled' ? outbreaks.value : mockData.outbreaks,
    timeSeries: timeSeries.status === 'fulfilled' ? timeSeries.value : mockData.surveillanceTimeSeries,
    warnings: warnings.status === 'fulfilled' ? warnings.value : mockData.earlyWarningLog,
    hotspots: hotspots.status === 'fulfilled' ? hotspots.value : mockData.mapHotspots,
    socialCases: socialCases.status === 'fulfilled' ? socialCases.value : mockData.socialCases,
    workflowSteps: workflowSteps.status === 'fulfilled' ? workflowSteps.value : mockData.workflowSteps,
    caseVolume: caseVolume.status === 'fulfilled' ? caseVolume.value : mockData.caseVolume,
    capacity: capacity.status === 'fulfilled' ? capacity.value : mockData.caseworkerCapacity,
    outcomes: outcomes.status === 'fulfilled' ? outcomes.value : mockData.programOutcomes
  };
}

function populatePopulationTab(data) {
  renderSdohBars(data.sdoh);
}

function renderSdohBars(sdoh) {
  const container = document.getElementById('sdohBars');
  if (!container || !sdoh) return;
  container.innerHTML = sdoh.map(item => `
    <div class="prog-row">
      <div class="prog-header">
        <span>${item.label}</span>
        <span style="font-weight:600">${item.value}%</span>
      </div>
      <div class="prog-bar">
        <div class="prog-fill" style="width:0%;background:${item.color}" data-target="${item.value}"></div>
      </div>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    container.querySelectorAll('.prog-fill').forEach(fill => {
      fill.style.width = fill.dataset.target + '%';
    });
  });
}

function renderOutbreaksTable(outbreaks) {
  const tbody = document.getElementById('outbreaksTbody');
  if (!tbody) return;

  tbody.innerHTML = outbreaks.map(o => {
    const trendClass = o.trend === 'up' ? 'trend-up' : o.trend === 'down' ? 'trend-down' : 'trend-flat';
    const statusClass = `status-${o.status}`;
    return `
      <tr data-outbreak-id="${o.id}" style="cursor:pointer">
        <td style="font-weight:500">${o.disease}</td>
        <td>${o.district}</td>
        <td><strong>${o.cases7d.toLocaleString()}</strong></td>
        <td class="${trendClass}">${o.trendPct}%</td>
        <td><span class="status-badge ${statusClass}">${o.status}</span></td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.outbreakId;
      const outbreak = outbreaksCache.find(o => o.id === id);
      if (outbreak) showOutbreakDrawer(outbreak);
    });
  });
}

function showOutbreakDrawer(outbreak) {
  const statusColors = { critical: 'badge-red', elevated: 'badge-amber', monitoring: 'badge-blue', improving: 'badge-green' };
  const content = `
    <div style="margin-bottom:16px">
      <span class="card-badge ${statusColors[outbreak.status] || 'badge-blue'}">${outbreak.status}</span>
      <span style="margin-left:10px;font-size:13px;color:var(--text-secondary)">${outbreak.district} District</span>
    </div>
    <div class="grid-2" style="margin-bottom:16px">
      <div style="background:var(--bg-primary);padding:10px;border-radius:8px;text-align:center">
        <div style="font-size:22px;font-weight:800;color:var(--ms-blue)">${outbreak.cases7d.toLocaleString()}</div>
        <div style="font-size:11px;color:var(--text-muted)">Cases (7d)</div>
      </div>
      <div style="background:var(--bg-primary);padding:10px;border-radius:8px;text-align:center">
        <div style="font-size:22px;font-weight:800;color:${outbreak.trend === 'up' ? 'var(--ms-red)' : 'var(--ms-green)'}">${outbreak.trend === 'up' ? '+' : '-'}${outbreak.trendPct}%</div>
        <div style="font-size:11px;color:var(--text-muted)">Week-over-Week</div>
      </div>
    </div>
    <div class="card-title" style="margin-bottom:10px">30-Day Trajectory</div>
    <div class="drawer-chart-wrap"><canvas id="trajectoryChart"></canvas></div>
    <div style="margin-top:16px;font-size:12px;color:var(--text-secondary);line-height:1.6">
      <strong>AI Assessment:</strong> Based on current trajectory, cases are projected to 
      ${outbreak.trend === 'up' ? `reach a peak of ~${Math.round(outbreak.cases7d * 1.4).toLocaleString()} around Day 14 without intervention.` : `stabilise and decline over the next 10–14 days.`}
    </div>
  `;
  openDrawer({ title: outbreak.disease, content });
  requestAnimationFrame(() => {
    renderOutbreakTrajectoryChart('trajectoryChart', outbreak);
  });
}

function renderEarlyWarningLog(warnings) {
  const container = document.getElementById('earlyWarningLog');
  if (!container || !warnings) return;
  container.innerHTML = `
    <div class="timeline">
      ${warnings.map(w => `
        <div class="tl-item">
          <div class="tl-dot ${w.dot}"></div>
          <div class="tl-title">${w.title}</div>
          <div class="tl-meta">${w.meta}</div>
          <div class="tl-desc">${w.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMapHotspots(hotspots) {
  const container = document.getElementById('mapHotspots');
  if (!container) return;
  container.innerHTML = hotspots.map(h => `
    <div class="map-hotspot" style="left:${h.x}%;top:${h.y}%" data-hotspot-id="${h.id}">
      <div class="dot ${h.type === 'critical' ? '' : h.type === 'amber' ? 'amber' : 'blue'}" 
           style="background:${h.type === 'critical' ? 'var(--ms-red)' : h.type === 'amber' ? 'var(--ms-amber)' : 'var(--ms-blue)'}"
           aria-label="${h.label}"></div>
    </div>
  `).join('');

  container.querySelectorAll('.map-hotspot').forEach(hs => {
    hs.addEventListener('click', e => {
      e.stopPropagation();
      const id = hs.dataset.hotspotId;
      const hotspot = hotspotsCache.find(h => h.id === id);
      if (hotspot) showHotspotTooltip(hotspot, hs);
    });
  });

  document.addEventListener('click', hideHotspotTooltip);
}

function showHotspotTooltip(hotspot, anchorEl) {
  hideHotspotTooltip();
  const map = document.getElementById('mapContainer');
  if (!map) return;

  const tip = document.createElement('div');
  tip.className = 'map-tooltip visible';
  tip.id = 'mapTooltip';
  const rect = anchorEl.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();

  tip.style.left = (rect.left - mapRect.left + 20) + 'px';
  tip.style.top = (rect.top - mapRect.top - 10) + 'px';

  const nameEl = document.createElement('div');
  nameEl.style.cssText = 'font-weight:600;margin-bottom:4px';
  nameEl.textContent = hotspot.label;

  const metaEl = document.createElement('div');
  metaEl.style.cssText = 'color:var(--text-muted);margin-bottom:6px';
  metaEl.textContent = `${hotspot.district} · Risk: ${hotspot.riskLevel}`;

  const casesEl = document.createElement('div');
  casesEl.style.marginBottom = '6px';
  casesEl.textContent = 'Active Cases: ';
  const casesBold = document.createElement('strong');
  casesBold.textContent = hotspot.activeCases.toLocaleString();
  casesEl.appendChild(casesBold);

  const descEl = document.createElement('div');
  descEl.style.cssText = 'font-size:12px;color:var(--text-secondary);margin-bottom:10px';
  descEl.textContent = hotspot.description;

  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.style.cssText = 'font-size:12px;padding:5px 12px;border-radius:5px;cursor:pointer';
  btn.textContent = 'View full report →';
  btn.addEventListener('click', () => {
    document.querySelector('[data-tab="surveillance"]')?.click();
  });

  tip.appendChild(nameEl);
  tip.appendChild(metaEl);
  tip.appendChild(casesEl);
  tip.appendChild(descEl);
  tip.appendChild(btn);

  map.appendChild(tip);
  activeTooltip = tip;
}

function hideHotspotTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

function renderSocialCases(cases) {
  const container = document.getElementById('socialCaseList');
  if (!container) return;

  if (!cases || cases.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div>📭 No cases match your filters</div>
        <button data-action="clear-filters">Clear filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cases.map(c => {
    const scoreColor = c.riskScore >= 85 ? 'var(--ms-red)' : c.riskScore >= 70 ? 'var(--ms-amber)' : 'var(--ms-green)';
    return `
      <div class="case-row" data-case-id="${c.id}" tabindex="0" role="button" aria-label="Case: ${c.title}">
        <div class="case-icon" style="background:var(--ms-blue-light)">${c.icon}</div>
        <div class="case-body">
          <div class="case-title">${c.title}</div>
          <div class="case-meta">${c.meta}</div>
        </div>
        <div class="case-right">
          <div class="case-score" style="color:${scoreColor}">${c.riskScore}</div>
          <div style="font-size:11px;color:var(--text-muted)">Risk Score</div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.case-row').forEach(row => {
    const handler = () => {
      const id = row.dataset.caseId;
      const caseData = (store.get('socialCases') || socialCasesCache).find(c => c.id === id);
      if (caseData) showCaseDrawer(caseData);
    };
    row.addEventListener('click', handler);
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
}

function showCaseDrawer(caseData) {
  const scoreColor = caseData.riskScore >= 85 ? 'var(--ms-red)' : caseData.riskScore >= 70 ? 'var(--ms-amber)' : 'var(--ms-green)';
  const content = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <span style="font-size:28px">${caseData.icon}</span>
      <div>
        <div style="font-weight:600;font-size:14px">${caseData.title}</div>
        <div style="font-size:12px;color:var(--text-muted)">${caseData.meta}</div>
      </div>
      <div style="margin-left:auto;text-align:center">
        <div style="font-size:22px;font-weight:800;color:${scoreColor}">${caseData.riskScore}</div>
        <div style="font-size:11px;color:var(--text-muted)">Risk Score</div>
      </div>
    </div>

    <div class="card-title" style="margin-bottom:8px">Case Notes</div>
    <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px">${caseData.notes}</p>

    <div class="card-title" style="margin-bottom:8px">Case History</div>
    <div class="case-history-timeline">
      ${caseData.history.map(h => `
        <div class="case-history-item">
          <div class="case-history-dot"></div>
          <div class="case-history-date">${h.date}</div>
          <div class="case-history-action">${h.action}</div>
          <div class="case-history-by">by ${h.by}</div>
        </div>
      `).join('')}
    </div>

    <div class="card-title" style="margin-bottom:8px">Add Note</div>
    <div class="note-input-area">
      <textarea id="caseNoteInput" placeholder="Type a case note..." aria-label="Case note input"></textarea>
      <button class="note-save-btn" id="caseNoteSaveBtn">Save Note</button>
    </div>

    <div class="case-action-bar" style="margin-top:20px">
      <button class="btn-primary" id="assignCaseworkerBtn">👤 Assign Caseworker</button>
      <button class="btn-danger" id="escalateBtn">🚨 Escalate</button>
    </div>
  `;

  openDrawer({ title: caseData.id + ' — Case Detail', content });

  requestAnimationFrame(() => {
    document.getElementById('assignCaseworkerBtn')?.addEventListener('click', () => {
      showToast('Assigned to District Health Team', 'success');
    });

    document.getElementById('escalateBtn')?.addEventListener('click', () => {
      showToast(`Case ${caseData.id} escalated — risk score updated`, 'warning');
      const cases = store.get('socialCases') || socialCasesCache;
      const updated = cases.map(c => c.id === caseData.id ? { ...c, riskScore: Math.min(99, c.riskScore + 5) } : c);
      store.set('socialCases', updated);
      closeDrawer();
    });

    document.getElementById('caseNoteSaveBtn')?.addEventListener('click', () => {
      const note = document.getElementById('caseNoteInput')?.value.trim();
      if (!note) return;
      showToast('Note saved to case record', 'success');
      document.getElementById('caseNoteInput').value = '';
    });
  });
}

function renderWorkflowSteps(steps) {
  const container = document.getElementById('workflowSteps');
  if (!container || !steps) return;
  container.innerHTML = steps.map(s => {
    const badgeClass = s.status === 'done' ? 'ws-done' : s.status === 'active' ? 'ws-active' : 'ws-pending';
    const badgeLabel = s.status === 'done' ? 'Done' : s.status === 'active' ? 'In Progress' : 'Pending';
    return `
      <div class="workflow-step ${s.status}" data-step-id="${s.id}">
        <div class="ws-icon">${s.icon}</div>
        <div class="ws-label">${s.label}</div>
        <span class="ws-badge ${badgeClass}">${badgeLabel}</span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.workflow-step.pending').forEach(step => {
    step.addEventListener('click', () => {
      const id = step.dataset.stepId;
      const stepData = (store.get('workflowSteps') || workflowStepsCache).find(s => s.id === id);
      if (!stepData) return;

      openModal({
        title: 'Advance Workflow Step',
        content: `<p style="font-size:14px;line-height:1.6">Advance <strong>${stepData.label}</strong> to <em>In Progress</em>?</p>`,
        size: 'sm',
        actions: [
          {
            label: 'Confirm',
            primary: true,
            onClick: () => {
              const steps = store.get('workflowSteps') || workflowStepsCache;
              const updated = steps.map(s => {
                if (s.status === 'active') return { ...s, status: 'done' };
                if (s.id === id) return { ...s, status: 'active' };
                return s;
              });
              store.set('workflowSteps', updated);
              workflowStepsCache = updated;
              renderWorkflowSteps(updated);
              closeModal();
              showToast(`${stepData.label} moved to In Progress`, 'success');
            }
          },
          { label: 'Cancel', primary: false, onClick: closeModal }
        ]
      });
    });
  });
}

function renderProgramOutcomes(outcomes) {
  if (!outcomes) return;
  const ids = {
    housing: 'outcomeHousing',
    benefits: 'outcomeBenefits',
    selfSufficiency: 'outcomeSelf',
    repeatCrisis: 'outcomeRepeat'
  };
  Object.entries(ids).forEach(([key, id]) => {
    const el = document.getElementById(id);
    const o = outcomes[key];
    if (el && o) {
      el.innerHTML = `
        <div class="scorecard-val" style="color:${o.positive ? 'var(--ms-green)' : 'var(--ms-red)'}">${typeof o.value === 'number' && o.value > 999 ? o.value.toLocaleString() : o.value}${key === 'selfSufficiency' || key === 'repeatCrisis' ? '%' : ''}</div>
        <div class="scorecard-lbl">${o.label}</div>
        <div class="stat-delta ${o.positive ? 'delta-up' : 'delta-down'}" style="font-size:11px;justify-content:center">${o.delta}</div>
      `;
    }
  });
}

function initFilterBar() {
  const searchInput = document.getElementById('caseSearch');
  const districtSelect = document.getElementById('caseDistrict');
  const riskSlider = document.getElementById('caseRiskMin');
  const riskValue = document.getElementById('riskMinValue');
  const clearBtn = document.getElementById('filterClearBtn');

  const applyFilters = async () => {
    const filters = {
      search: searchInput?.value || '',
      district: districtSelect?.value || 'all',
      riskMin: parseInt(riskSlider?.value || '0', 10)
    };
    const cases = await import('../api/social.js').then(m => m.fetchSocialCases(filters));
    renderSocialCases(cases);
  };

  const clearFilters = () => {
    if (searchInput) searchInput.value = '';
    if (districtSelect) districtSelect.value = 'all';
    if (riskSlider) riskSlider.value = '0';
    if (riskValue) riskValue.textContent = '0';
    applyFilters();
  };

  searchInput?.addEventListener('input', applyFilters);
  districtSelect?.addEventListener('change', applyFilters);
  riskSlider?.addEventListener('input', () => {
    if (riskValue) riskValue.textContent = riskSlider.value;
    applyFilters();
  });
  clearBtn?.addEventListener('click', clearFilters);

  // Also wire the empty-state clear button via event delegation
  document.getElementById('socialCaseList')?.addEventListener('click', e => {
    if (e.target.matches('[data-action="clear-filters"]')) clearFilters();
  });
}

function initExportCsv() {
  const exportBtn = document.getElementById('exportOutbreaksBtn');
  exportBtn?.addEventListener('click', () => {
    const headers = ['Disease', 'District', 'Cases (7d)', 'Trend %', 'Status'];
    const rows = outbreaksCache.map(o => [
      o.disease, o.district, o.cases7d, (o.trend === 'up' ? '+' : '-') + o.trendPct + '%', o.status
    ]);
    exportToCsv('outbreaks.csv', headers, rows);
    showToast('Outbreak data exported as CSV', 'success');
  });
}

function startLastUpdatedCounter() {
  const el = document.getElementById('lastUpdated');
  setInterval(() => {
    secondsCounter++;
    if (el) {
      if (secondsCounter < 60) {
        el.textContent = `${secondsCounter}s ago`;
      } else if (secondsCounter < 3600) {
        el.textContent = `${Math.floor(secondsCounter / 60)} min ago`;
      } else {
        el.textContent = `${Math.floor(secondsCounter / 3600)}h ago`;
      }
    }
  }, 1000);
}

function showRefreshPill(show) {
  const pill = document.getElementById('refreshPill');
  if (pill) {
    if (show) pill.classList.add('visible');
    else pill.classList.remove('visible');
  }
}

async function doRefresh() {
  showRefreshPill(true);
  try {
    const data = await loadAllData();
    outbreaksCache = data.outbreaks;
    socialCasesCache = data.socialCases;
    workflowStepsCache = data.workflowSteps;
    hotspotsCache = data.hotspots;

    store.set('interventions', data.interventions);
    store.set('socialCases', data.socialCases);
    store.set('workflowSteps', data.workflowSteps);
    store.set('dataSnapshot', { ...data, kpis: data.kpis, outbreaks: data.outbreaks, copilotSuggestions: mockData.copilotSuggestions });

    renderOutbreaksTable(data.outbreaks);
    renderEarlyWarningLog(data.warnings);
    renderMapHotspots(data.hotspots);
    renderSocialCases(data.socialCases);
    renderWorkflowSteps(data.workflowSteps);
    populatePopulationTab(data);

    updateCharts(
      { trends: { highRisk: data.trends.highRisk, activePrograms: data.trends.activePrograms, vaccinationCoverage: data.trends.vaccinationCoverage }, risk: data.risk },
      { timeSeries: data.timeSeries },
      {}
    );

    secondsCounter = 0;
    showToast('Data refreshed', 'info', 2000);
  } catch (e) {
    showToast('Refresh failed — retrying', 'error', 3000);
    setTimeout(doRefresh, 5000);
  } finally {
    showRefreshPill(false);
  }
}

async function init() {
  store.set('alerts', [
    { id: 'A1', icon: '🔴', text: 'Respiratory illness surge — Eastern District (+34% WoW)', severity: 'critical' },
    { id: 'A2', icon: '🟡', text: 'Vaccine coverage gap — Rural Zone B (<68%)', severity: 'warning' },
    { id: 'A3', icon: '🟡', text: 'Wastewater SARS-CoV-2 signal elevated — Sector 4', severity: 'warning' },
    { id: 'A4', icon: '🔵', text: '3 AI-generated intervention plans ready for review', severity: 'info' }
  ]);
  store.set('dismissedAlerts', []);
  store.set('copilotHistory', []);
  store.set('dataSnapshot', { kpis: mockData.kpis, outbreaks: mockData.outbreaks, copilotSuggestions: mockData.copilotSuggestions });

  initAlerts();

  initTabs((tabName, isFirst) => {
    if (isFirst && tabName === 'surveillance') {
      initSurveillanceCharts({ timeSeries: store.get('dataSnapshot')?.timeSeries || mockData.surveillanceTimeSeries });
    }
    if (isFirst && tabName === 'social') {
      initSocialCharts({ caseVolume: store.get('dataSnapshot')?.caseVolume || mockData.caseVolume, capacity: store.get('dataSnapshot')?.capacity || mockData.caseworkerCapacity });
    }
  });

  initCopilotChat();
  initFilterBar();
  initExportCsv();
  startLastUpdatedCounter();

  const data = await loadAllData();
  outbreaksCache = data.outbreaks;
  socialCasesCache = data.socialCases;
  workflowStepsCache = data.workflowSteps;
  hotspotsCache = data.hotspots;

  store.set('interventions', data.interventions);
  store.set('socialCases', data.socialCases);
  store.set('workflowSteps', data.workflowSteps);
  store.set('dataSnapshot', { ...data, kpis: data.kpis, outbreaks: data.outbreaks, copilotSuggestions: mockData.copilotSuggestions });

  const kpis = data.kpis;
  animateCounter(document.getElementById('kpi1'), kpis.citizensMonitored, '', 1800);
  animateCounter(document.getElementById('kpi2'), kpis.activeAlerts, '', 800);
  animateCounter(document.getElementById('kpi3'), kpis.earlierDetection, '<sup>%</sup>', 1200);
  animateCounter(document.getElementById('kpi4'), kpis.manualTriageReduction, '<sup>%</sup>', 1200);
  animateCounter(document.getElementById('kpi5'), kpis.fasterReporting, '<sup>x</sup>', 1000);

  initPopulationCharts({
    trends: { labels: data.trends.labels || mockData.populationTrends.labels, highRisk: data.trends.highRisk, activePrograms: data.trends.activePrograms, vaccinationCoverage: data.trends.vaccinationCoverage },
    risk: data.risk,
    chronic: data.chronic
  });

  initInterventions();

  populatePopulationTab(data);
  renderOutbreaksTable(data.outbreaks);
  renderEarlyWarningLog(data.warnings);
  renderMapHotspots(data.hotspots);
  renderSocialCases(data.socialCases);
  renderWorkflowSteps(data.workflowSteps);
  renderProgramOutcomes(data.outcomes);

  store.subscribe('socialCases', renderSocialCases);
  store.subscribe('workflowSteps', renderWorkflowSteps);

  setInterval(doRefresh, REFRESH_INTERVAL);
}

document.addEventListener('DOMContentLoaded', init);
