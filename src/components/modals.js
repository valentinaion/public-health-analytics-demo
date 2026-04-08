let activeModal = null;
let activeDrawer = null;

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  ));
}

function trapFocus(container, e) {
  const focusable = getFocusableElements(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
}

export function openModal({ title, content, actions = [], size = 'md' }) {
  closeModal();
  const container = document.getElementById('modalContainer');
  if (!container) return;

  const sizeMap = { sm: '400px', md: '560px', lg: '800px' };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);

  const actionsHtml = actions.map((a, i) =>
    `<button class="modal-btn ${a.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}" data-action-idx="${i}">${a.label}</button>`
  ).join('');

  overlay.innerHTML = `
    <div class="modal-box" style="max-width:${sizeMap[size] || sizeMap.md}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">${content}</div>
      ${actions.length ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
    </div>
  `;

  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  actions.forEach((action, i) => {
    const btn = overlay.querySelector(`[data-action-idx="${i}"]`);
    if (btn) btn.addEventListener('click', () => { action.onClick && action.onClick(); });
  });

  const trapHandler = e => trapFocus(overlay.querySelector('.modal-box'), e);
  const escHandler = e => { if (e.key === 'Escape') closeModal(); };

  document.addEventListener('keydown', trapHandler);
  document.addEventListener('keydown', escHandler);

  overlay._cleanup = () => {
    document.removeEventListener('keydown', trapHandler);
    document.removeEventListener('keydown', escHandler);
  };

  container.appendChild(overlay);
  activeModal = overlay;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    overlay.classList.add('modal-overlay-visible');
    const focusable = getFocusableElements(overlay.querySelector('.modal-box'));
    if (focusable.length) focusable[0].focus();
  });
}

export function closeModal() {
  if (!activeModal) return;
  const modal = activeModal;
  modal._cleanup && modal._cleanup();
  modal.classList.remove('modal-overlay-visible');
  modal.classList.add('modal-overlay-hiding');
  modal.addEventListener('animationend', () => { modal.remove(); }, { once: true });
  activeModal = null;
  document.body.style.overflow = '';
}

export function openDrawer({ title, content, side = 'right' }) {
  closeDrawer();
  const container = document.getElementById('modalContainer');
  if (!container) return;

  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';

  overlay.innerHTML = `
    <div class="drawer drawer-${side}">
      <div class="drawer-header">
        <h3 class="drawer-title">${title}</h3>
        <button class="modal-close" aria-label="Close drawer">×</button>
      </div>
      <div class="drawer-body">${content}</div>
    </div>
  `;

  overlay.querySelector('.modal-close').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDrawer(); });

  const escHandler = e => { if (e.key === 'Escape') closeDrawer(); };
  document.addEventListener('keydown', escHandler);
  overlay._cleanup = () => document.removeEventListener('keydown', escHandler);

  container.appendChild(overlay);
  activeDrawer = overlay;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    overlay.classList.add('drawer-overlay-visible');
    const drawer = overlay.querySelector('.drawer');
    drawer.classList.add('drawer-visible');
  });
}

export function closeDrawer() {
  if (!activeDrawer) return;
  const drawer = activeDrawer;
  drawer._cleanup && drawer._cleanup();
  drawer.classList.remove('drawer-overlay-visible');
  drawer.classList.add('drawer-overlay-hiding');
  drawer.addEventListener('animationend', () => { drawer.remove(); }, { once: true });
  activeDrawer = null;
  document.body.style.overflow = '';
}
