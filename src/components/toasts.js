let toastContainer = null;

function getContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toastContainer');
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = getContainer();
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const msgEl = document.createElement('span');
  msgEl.className = 'toast-msg';
  msgEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.textContent = '×';

  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);

  const close = () => {
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  closeBtn.addEventListener('click', close);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(close, duration);
  }
}
