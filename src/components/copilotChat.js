import store from '../state/store.js';
import { getAIResponse } from '../api/copilot.js';
import { openModal, closeModal } from './modals.js';
import { showToast } from './toasts.js';

const _parser = new DOMParser();

// Allowed tags in AI response content. Attributes that may appear in responses.
const ALLOWED_TAGS = new Set(['strong','em','b','i','ul','ol','li','br','p','span','div','table','tr','td','th','thead','tbody']);
const ALLOWED_ATTRS = new Set(['style','class','colspan','rowspan']);

function importSafeNode(source) {
  // Text nodes are always safe
  if (source.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(source.textContent);
  }
  if (source.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = source.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    // Replace disallowed elements with a span containing their text
    const fallback = document.createElement('span');
    fallback.textContent = source.textContent;
    return fallback;
  }

  const el = document.createElement(tag);
  for (const attr of source.attributes) {
    if (ALLOWED_ATTRS.has(attr.name)) {
      el.setAttribute(attr.name, attr.value);
    }
  }
  for (const child of source.childNodes) {
    const safe = importSafeNode(child);
    if (safe) el.appendChild(safe);
  }
  return el;
}

function safeSetHTML(el, aiHtml) {
  // Parse AI-generated HTML (from getAIResponse() in copilot.js only) into an inert
  // document, then walk the tree importing only whitelisted tags and attributes.
  const doc = _parser.parseFromString(`<!DOCTYPE html><html><body>${aiHtml}`, 'text/html');
  for (const child of doc.body.childNodes) {
    const safe = importSafeNode(child);
    if (safe) el.appendChild(safe);
  }
}

const WELCOME_MESSAGE = {
  role: 'ai',
  text: `<strong>👋 Welcome to Copilot for Health Analytics</strong><br><br>
I'm your AI health intelligence assistant, with access to real-time data across all 5 districts including disease surveillance, population health metrics, and social services caseloads.<br><br>
<strong>I can help you:</strong>
<ul>
  <li>📊 Analyse disease outbreaks and forecast trajectories</li>
  <li>💉 Identify vaccine coverage gaps by district</li>
  <li>🏥 Plan hospital capacity and resource allocation</li>
  <li>👥 Prioritise high-risk social service cases</li>
  <li>💰 Calculate cost avoidance and ROI estimates</li>
  <li>📋 Generate executive briefings and reports</li>
</ul>
<br>Try asking a question or click one of the suggestions below.`,
  timestamp: Date.now()
};

function createMessageBubble(msg) {
  const isAI = msg.role === 'ai';
  const div = document.createElement('div');
  div.className = `msg ${isAI ? 'ai' : 'user'}`;

  const avatar = document.createElement('div');
  avatar.setAttribute('aria-hidden', 'true');

  if (isAI) {
    avatar.className = 'msg-avatar ai';
    avatar.textContent = '✨';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;flex:1';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.style.paddingRight = '36px';
    safeSetHTML(bubble, msg.text);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy-btn';
    copyBtn.title = 'Copy message';
    copyBtn.setAttribute('aria-label', 'Copy message to clipboard');
    copyBtn.textContent = '📋';
    copyBtn.addEventListener('click', () => {
      const text = bubble.innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓';
        copyBtn.title = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = '📋';
          copyBtn.title = 'Copy message';
        }, 2000);
      });
    });

    wrapper.appendChild(bubble);
    wrapper.appendChild(copyBtn);
    div.appendChild(avatar);
    div.appendChild(wrapper);
  } else {
    avatar.className = 'msg-avatar human';
    avatar.textContent = 'PH';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = msg.text;

    div.appendChild(avatar);
    div.appendChild(bubble);
  }

  return div;
}

function createTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg ai typing-msg';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar ai';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = '✨';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }

  bubble.appendChild(indicator);
  div.appendChild(avatar);
  div.appendChild(bubble);
  return div;
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

function renderSuggestions(chips, container) {
  if (!container) return;
  container.innerHTML = chips.map(text =>
    `<button class="suggestion-chip" type="button">${text}</button>`
  ).join('');

  container.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('copilotInput');
      if (input) {
        input.value = chip.textContent;
        chip.remove();
        document.getElementById('copilotSendBtn')?.click();
      }
    });
  });
}

export function initCopilotChat() {
  const messagesEl = document.getElementById('copilotMessages');
  const inputEl = document.getElementById('copilotInput');
  const sendBtn = document.getElementById('copilotSendBtn');
  const suggestionsEl = document.getElementById('copilotSuggestions');
  const charCounter = document.getElementById('charCounter');
  const clearBtn = document.getElementById('clearChatBtn');
  const reportBtn = document.getElementById('generateReportBtn');

  if (!messagesEl || !inputEl || !sendBtn) return;

  const history = store.get('copilotHistory') || [];
  if (history.length === 0) {
    store.set('copilotHistory', [WELCOME_MESSAGE]);
    messagesEl.appendChild(createMessageBubble(WELCOME_MESSAGE));
  } else {
    history.forEach(msg => messagesEl.appendChild(createMessageBubble(msg)));
  }

  const defaultSuggestions = store.get('dataSnapshot')?.copilotSuggestions?.slice(0, 4) || [
    'What are the top vaccine coverage gaps?',
    'Show me the highest risk social cases',
    'Generate executive briefing for today',
    'Analyse the Eastern District surge'
  ];
  renderSuggestions(defaultSuggestions, suggestionsEl);

  inputEl.addEventListener('input', () => {
    const len = inputEl.value.length;
    if (charCounter) charCounter.textContent = `${len} / ${MAX_CHARS}`;
    if (len > MAX_CHARS) inputEl.value = inputEl.value.slice(0, MAX_CHARS);
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  clearBtn?.addEventListener('click', () => {
    if (confirm('Clear the conversation history?')) {
      store.set('copilotHistory', [WELCOME_MESSAGE]);
      messagesEl.innerHTML = '';
      messagesEl.appendChild(createMessageBubble(WELCOME_MESSAGE));
      renderSuggestions(defaultSuggestions, suggestionsEl);
      showToast('Conversation cleared', 'info', 2000);
    }
  });

  reportBtn?.addEventListener('click', generateReport);

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    if (charCounter) charCounter.textContent = `0 / ${MAX_CHARS}`;
    sendBtn.disabled = true;

    const userMsg = { role: 'user', text, timestamp: Date.now() };
    const history = store.get('copilotHistory') || [];
    store.set('copilotHistory', [...history, userMsg]);

    messagesEl.appendChild(createMessageBubble(userMsg));
    scrollToBottom(messagesEl);

    const typingEl = createTypingIndicator();
    messagesEl.appendChild(typingEl);
    scrollToBottom(messagesEl);

    const delay = 1200 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));

    typingEl.remove();

    const response = getAIResponse(text, store.get('copilotHistory'));
    const aiMsg = { role: 'ai', text: response.text, timestamp: Date.now() };
    const updatedHistory = store.get('copilotHistory');
    store.set('copilotHistory', [...updatedHistory, aiMsg]);

    messagesEl.appendChild(createMessageBubble(aiMsg));
    scrollToBottom(messagesEl);

    if (response.suggestionsAfter?.length) {
      renderSuggestions(response.suggestionsAfter, suggestionsEl);
    }

    sendBtn.disabled = false;
    inputEl.focus();
  }
}

function generateReport() {
  const snapshot = store.get('dataSnapshot') || {};
  const alerts = (store.get('alerts') || []).filter(a => {
    const dismissed = store.get('dismissedAlerts') || [];
    return !dismissed.includes(a.id);
  });
  const interventions = store.get('interventions') || [];
  const kpis = snapshot.kpis || {};
  const outbreaks = snapshot.outbreaks || [];
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const content = `
    <div style="font-family:'Segoe UI',system-ui,sans-serif;line-height:1.7;font-size:13px">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #0078D4;margin-bottom:20px">
        <div style="font-size:18px;font-weight:700;color:#005A9E">MICROSOFT HEALTHSYNC ANALYTICS</div>
        <div style="font-size:13px;color:#605E5C;margin-top:4px">Executive Briefing · ${today}</div>
        <div style="font-size:11px;color:#D13438;font-weight:600;margin-top:4px;letter-spacing:.5px">CONFIDENTIAL — Public Health Agency</div>
      </div>

      <h4 style="color:#005A9E;font-size:12px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Situation Summary</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
        <div style="background:#F3F2F1;padding:10px;border-radius:6px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#0078D4">${kpis.citizensMonitored ? (kpis.citizensMonitored/1000000).toFixed(1)+'M' : '2.4M'}</div>
          <div style="font-size:11px;color:#605E5C">Citizens Monitored</div>
        </div>
        <div style="background:#FDE7E9;padding:10px;border-radius:6px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#D13438">${alerts.length}</div>
          <div style="font-size:11px;color:#605E5C">Active Alerts</div>
        </div>
        <div style="background:#DFF6DD;padding:10px;border-radius:6px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#107C10">${kpis.earlierDetection || 76}%</div>
          <div style="font-size:11px;color:#605E5C">Earlier Detection</div>
        </div>
      </div>

      <h4 style="color:#005A9E;font-size:12px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Active Alerts (${alerts.length})</h4>
      <ul style="margin:0 0 20px 16px">
        ${alerts.map(a => `<li>${a.icon} ${a.text}</li>`).join('') || '<li>No active alerts</li>'}
      </ul>

      <h4 style="color:#005A9E;font-size:12px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Disease Surveillance</h4>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px">
        <tr style="background:#F3F2F1"><th style="padding:7px 10px;text-align:left">Disease</th><th style="padding:7px 10px;text-align:left">District</th><th style="padding:7px 10px;text-align:center">Cases (7d)</th><th style="padding:7px 10px;text-align:center">Status</th></tr>
        ${outbreaks.map(o => `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #EDEBE9">${o.disease}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #EDEBE9">${o.district}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #EDEBE9;text-align:center">${o.cases7d}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #EDEBE9;text-align:center">${o.status}</td>
        </tr>`).join('')}
      </table>

      <h4 style="color:#005A9E;font-size:12px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Recommended Actions</h4>
      ${interventions.map(i => `
        <div style="border-left:3px solid ${i.priority==='high'?'#D13438':i.priority==='medium'?'#FF8C00':'#107C10'};padding:8px 12px;margin-bottom:8px;background:#F3F2F1;border-radius:0 6px 6px 0">
          <div style="font-weight:600;font-size:13px">${i.title}</div>
          <div style="font-size:12px;color:#605E5C;margin-top:2px">Status: ${i.status} · ${i.impact}</div>
        </div>
      `).join('')}

      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #EDEBE9;text-align:center;font-size:11px;color:#A19F9D">
        Generated by Copilot for Health Analytics · Azure OpenAI GPT-4o<br>
        ${new Date().toISOString()}
      </div>
    </div>
  `;

  openModal({
    title: 'Executive Health Briefing — ' + today,
    content,
    size: 'lg',
    actions: [
      {
        label: '🖨 Export PDF',
        primary: true,
        onClick: () => window.print()
      },
      {
        label: 'Close',
        primary: false,
        onClick: closeModal
      }
    ]
  });
}
