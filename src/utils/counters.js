export function animateCounter(el, target, suffix = '', duration = 1800) {
  if (!el) return;
  const start = performance.now();
  const isLarge = target >= 1000000;
  const isMedium = target >= 1000;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function format(val) {
    if (isLarge) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    if (isMedium && target >= 10000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return Math.round(val).toString();
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(easeOut(progress) * target);
    el.innerHTML = format(current) + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.innerHTML = format(target) + suffix;
    }
  }

  requestAnimationFrame(step);
}
