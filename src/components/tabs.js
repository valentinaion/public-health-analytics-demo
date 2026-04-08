import store from '../state/store.js';

const initializedTabs = new Set();
let onTabChange = null;

export function initTabs(onTabChangeCallback) {
  onTabChange = onTabChangeCallback;

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn));
    btn.addEventListener('keydown', e => handleTabKey(e, tabBtns));
  });

  const firstActive = document.querySelector('.tab-btn.active');
  if (firstActive) {
    const tabName = firstActive.dataset.tab;
    initializedTabs.add(tabName);
    store.set('activeTab', tabName);
  }
}

function switchTab(btn) {
  const tabName = btn.dataset.tab;
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  tabPanels.forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  const panel = document.getElementById('tab-' + tabName);
  if (panel) {
    panel.classList.add('active');
  }

  store.set('activeTab', tabName);

  if (!initializedTabs.has(tabName)) {
    initializedTabs.add(tabName);
    if (onTabChange) onTabChange(tabName, true);
  } else {
    if (onTabChange) onTabChange(tabName, false);
  }
}

function handleTabKey(e, tabBtns) {
  const tabs = Array.from(tabBtns);
  const idx = tabs.indexOf(e.currentTarget);

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const next = tabs[(idx + 1) % tabs.length];
    next.focus();
    switchTab(next);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
    prev.focus();
    switchTab(prev);
  } else if (e.key === 'Home') {
    e.preventDefault();
    tabs[0].focus();
    switchTab(tabs[0]);
  } else if (e.key === 'End') {
    e.preventDefault();
    tabs[tabs.length - 1].focus();
    switchTab(tabs[tabs.length - 1]);
  }
}
