import store from '../state/store.js';
import { openModal, closeModal } from './modals.js';
import { showToast } from './toasts.js';

function getStatusLabel(status) {
  switch (status) {
    case 'approved': return { label: 'Approved', cls: 'badge-green' };
    case 'in_review': return { label: 'In Review', cls: 'badge-amber' };
    case 'pending': return { label: 'Pending', cls: 'badge-blue' };
    default: return { label: 'Pending', cls: 'badge-blue' };
  }
}

function getActionLabel(status) {
  switch (status) {
    case 'approved': return 'Schedule';
    case 'in_review': return 'Approve';
    default: return 'Review';
  }
}

function renderInterventions(interventions) {
  const grid = document.getElementById('interventionGrid');
  if (!grid || !interventions) return;

  grid.innerHTML = interventions.map(item => {
    const s = getStatusLabel(item.status);
    const actionLabel = getActionLabel(item.status);
    return `
      <div class="int-card ${item.priority}" data-int-id="${item.id}">
        <div class="int-priority">${item.priority.toUpperCase()} PRIORITY</div>
        <div class="int-title">${item.title}</div>
        <div class="int-desc">${item.description}</div>
        <div class="int-footer">
          <span class="int-impact">📈 ${item.impact}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="card-badge ${s.cls}">${s.label}</span>
            <button class="int-btn" data-int-id="${item.id}" data-action="${actionLabel}">
              ${actionLabel}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.int-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.intId;
      const action = btn.dataset.action;
      handleIntervention(id, action);
    });
  });
}

function handleIntervention(id, action) {
  const interventions = store.get('interventions') || [];
  const item = interventions.find(i => i.id === id);
  if (!item) return;

  const actionMap = {
    'Review': { next: 'in_review', verb: 'begin review of', toastMsg: 'Intervention moved to review' },
    'Approve': { next: 'approved', verb: 'approve', toastMsg: 'Intervention approved ✓' },
    'Schedule': { next: 'scheduled', verb: 'schedule', toastMsg: 'Intervention scheduled' }
  };

  const actionConfig = actionMap[action] || actionMap['Review'];

  const content = `
    <div style="margin-bottom:16px">
      <p style="font-size:14px;color:var(--text-secondary);line-height:1.6">
        You are about to <strong>${actionConfig.verb}</strong> the following intervention:
      </p>
    </div>
    <div style="padding:14px;background:var(--bg-primary);border-radius:8px;margin-bottom:16px">
      <div style="font-weight:600;margin-bottom:4px">${item.title}</div>
      <div style="font-size:13px;color:var(--text-secondary)">${item.description}</div>
    </div>
    <div style="font-size:13px;line-height:1.8">
      <div><strong>Notify:</strong> ${item.notifyList.join(', ')}</div>
      <div><strong>Timeline:</strong> ${item.timeline}</div>
      <div><strong>Resources:</strong> ${item.resources}</div>
      <div><strong>Expected Impact:</strong> ${item.impact}</div>
    </div>
  `;

  openModal({
    title: `${action} Intervention — ${item.id}`,
    content,
    size: 'md',
    actions: [
      {
        label: `Confirm ${action}`,
        primary: true,
        onClick: () => {
          const updated = interventions.map(i =>
            i.id === id ? { ...i, status: actionConfig.next } : i
          );
          store.set('interventions', updated);
          closeModal();
          showToast(actionConfig.toastMsg, 'success');
        }
      },
      {
        label: 'Cancel',
        primary: false,
        onClick: closeModal
      }
    ]
  });
}

export function initInterventions() {
  store.subscribe('interventions', renderInterventions);

  const interventions = store.get('interventions');
  if (interventions) renderInterventions(interventions);
}
