export function animateCounter(el, target, suffix = '', duration = 1800) {
  if (!el) return;
  const start = performance.now();
  const isLarge = target >= 1000000;
  const isMedium = target >= 10000;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function format(val) {
    if (isLarge) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    if (isMedium) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return Math.round(val).toString();
  }

  // Set the text part separately from the suffix (which is a trusted HTML superscript)
  function update(val) {
    el.textContent = format(val);
    if (suffix) {
      // suffix is a hard-coded HTML superscript from animateCounter call sites only
      const supEl = el.querySelector('sup');
      if (!supEl) {
        const temp = document.createElement('template');
        temp.innerHTML = suffix;
        if (temp.content.firstChild) el.appendChild(temp.content.firstChild);
      }
    }
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(easeOut(progress) * target);
    update(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      update(target);
    }
  }

  requestAnimationFrame(step);
}
