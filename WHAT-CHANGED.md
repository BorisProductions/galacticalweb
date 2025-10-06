# What Changed in initFaq - Quick Reference

## The Problem

Your current `initFaq` function only handled:
- ✅ Accordion open/close
- ✅ Flip button setup  
- ✅ Manual button clicks
- ❌ **Scroll-based navigation (MISSING)**
- ❌ **Initial active state (MISSING)**

## The Missing Code

### Add This Section After Button Setup

```javascript
// === ADD THIS SECTION ===
// Scroll-based navigation highlighting
const rows = container.querySelectorAll("[data-faq-nav='row']");
const links = container.querySelectorAll("[data-faq-nav='link']");

function setActiveLink(activeIndex) {
  const safeIndex = Math.max(0, Math.min(activeIndex, buttons.length - 1));
  
  buttons.forEach((btn, index) => {
    if (index === safeIndex) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (window.Flip && bg) {
    try {
      const activeButton = buttons[safeIndex];
      if (activeButton && !activeButton.contains(bg)) {
        const state = Flip.getState(bg);
        activeButton.appendChild(bg);
        Flip.from(state, { duration: 0.4, ease: "power2.out" });
      }
    } catch(e) {}
  }
}

// Create ScrollTriggers for each FAQ section
if (rows.length) {
  rows.forEach((row, index) => {
    ScrollTrigger.create({
      trigger: row,
      start: "top 30%",
      end: "bottom 30%",
      onEnter: () => setActiveLink(index),
      onEnterBack: () => setActiveLink(index),
      onLeave: () => {
        if (index < rows.length - 1) {
          setActiveLink(index + 1);
        }
      },
      onLeaveBack: () => {
        if (index > 0) {
          setActiveLink(index - 1);
        }
      }
    });
  });
}

// Set initial active state based on scroll position
gsap.delayedCall(0.2, () => {
  if (!rows.length) return;
  
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  let activeIdx = 0;
  
  rows.forEach((row, idx) => {
    const rect = row.getBoundingClientRect();
    const rowTop = rect.top + scrollY;
    const triggerPoint = scrollY + (viewportHeight * 0.3);
    
    if (triggerPoint >= rowTop) {
      activeIdx = idx;
    }
  });
  
  setActiveLink(activeIdx);
});
// === END ADD ===
```

### Replace Button Click Handler

**OLD (incomplete):**
```javascript
// Tab click handlers
buttons.forEach(button => {
  button.addEventListener('click', function() {
    buttons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    initFlipHighlight();
  });
});
```

**NEW (with smooth scroll):**
```javascript
// Tab click handlers
buttons.forEach((button, index) => {
  const innerLink = button.querySelector('[data-faq-nav="link"]');
  
  button.addEventListener('click', function(e) {
    if (e.target.tagName !== 'A') {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
    }
    
    setActiveLink(index);
    
    if (innerLink) {
      const href = innerLink.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = container.querySelector(href);
        if (target) {
          if (typeof lenis !== 'undefined' && lenis && lenis.scrollTo) {
            lenis.scrollTo(target, { offset: -120, duration: 1 });
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  });
});
```

### Remove This (No Longer Needed)

**DELETE:**
```javascript
// Flip highlight animation
function initFlipHighlight() {
  try {
    if (window.Flip) {
      const state = Flip.getState(bg);
      const activeButton = container.querySelector('[data-flip-button="button"].active');
      if (activeButton && !activeButton.contains(bg)) {
        activeButton.appendChild(bg);
        Flip.from(state, { duration: 0.5, ease: "power2.out" });
      }
    }
  } catch(e) {}
}

initFlipHighlight(); // <-- Also remove this call
```

This functionality is now handled by the `setActiveLink()` function.

## Summary of Changes

| Feature | Before | After |
|---------|--------|-------|
| Scroll detection | ❌ | ✅ ScrollTriggers on each section |
| Active state on load | ❌ | ✅ Calculated based on scroll position |
| Smooth scroll to section | ❌ | ✅ Lenis integration + fallback |
| Flip animation | Manual only | Auto on scroll + manual |
| Edge cases | Not handled | Safe index clamping |

## Quick Integration Steps

1. Open your `js/index.js` file
2. Find the `initFaq` function (search for `function initFaq(container)`)
3. After the button setup code, add the scroll-based navigation code
4. Replace the button click handlers with the new version
5. Remove the old `initFlipHighlight()` function and its call
6. Save and test

## Expected Behavior

After the fix:

- ✅ Page loads → Correct section is highlighted based on scroll position
- ✅ Scroll down → Next section highlights automatically
- ✅ Scroll up → Previous section highlights automatically
- ✅ Click tab → Smooth scrolls to section and highlights
- ✅ Refresh page → Maintains correct highlighted section
- ✅ Barba navigation → Works when coming from any page

## Why It Works Now

### Old Code Problem:
```javascript
// Only ran on button click, not on scroll
button.addEventListener('click', function() {
  this.classList.add('active'); // Manual only
});
```

### New Code Solution:
```javascript
// Watches scroll position constantly
ScrollTrigger.create({
  trigger: row,
  onEnter: () => setActiveLink(index), // Auto on scroll down
  onEnterBack: () => setActiveLink(index), // Auto on scroll up
});
```

The key insight: **The old code only updated on manual clicks, not on scroll events.**
