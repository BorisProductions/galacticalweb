# FAQ Navigation Fix - Quick Checklist

## ✅ What You Need to Do

### Step 1: Locate the Function
Open `js/index.js` and search for:
```javascript
function initFaq(container) {
```

### Step 2: Find the Button Setup Section
Look for this code (around the middle of the function):
```javascript
// Tab buttons with Flip highlight
const buttons = container.querySelectorAll('[data-flip-button="button"]');
```

### Step 3: Add New Code After Button Setup

Right after you create the `bg` element and before the old click handlers, add:

```javascript
// === PASTE THIS NEW CODE HERE ===
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
// === END NEW CODE ===
```

### Step 4: Remove Old Code

Delete these old sections if they exist:

```javascript
// DELETE THIS:
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

initFlipHighlight();

// DELETE THIS TOO:
buttons.forEach(button => {
  button.addEventListener('click', function() {
    buttons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    initFlipHighlight();
  });
});
```

## ✅ Testing Checklist

After making changes, test these scenarios:

- [ ] **Direct load test**: Navigate directly to `/faq.html`
  - Expected: Correct tab is highlighted based on scroll position
  
- [ ] **From home test**: Click FAQ link from homepage
  - Expected: Navigation works, correct tab highlights
  
- [ ] **Scroll down test**: Scroll through FAQ sections
  - Expected: Active tab updates as each section enters view
  
- [ ] **Scroll up test**: Scroll back up through sections
  - Expected: Active tab updates in reverse
  
- [ ] **Click navigation test**: Click different tabs
  - Expected: Smooth scroll to section, tab highlights
  
- [ ] **Refresh test**: Refresh page while scrolled to a section
  - Expected: Correct tab remains highlighted
  
- [ ] **Mobile test**: Test on mobile device
  - Expected: All behaviors work on touch devices

## ⚠️ Common Issues

### Issue: "TypeError: Cannot read property 'appendChild' of undefined"
**Solution**: Make sure `bg` element is created before trying to use it.

### Issue: Navigation highlights wrong section
**Solution**: Check that your HTML has matching IDs:
- Button: `<a href="#faq-general">`
- Section: `<div id="faq-general" data-faq-nav="row">`

### Issue: Flip animation doesn't work
**Solution**: Ensure GSAP Flip plugin is loaded in your HTML:
```html
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js"></script>
```

### Issue: Scroll doesn't update tabs
**Solution**: Check ScrollTrigger is loaded and `rows.length > 0`

## 🎯 Key Points

1. **The core fix**: Adding ScrollTriggers that watch each FAQ section
2. **Why it works now**: Auto-updates on scroll, not just on click
3. **Initial state**: Calculates which section is visible on page load
4. **Smooth scroll**: Integrates with Lenis for better UX
5. **Edge cases**: Handles index bounds safely

## 📝 Before/After Comparison

**Before (broken):**
- Manual click only → Changes active tab
- Page load → First tab always active
- Scroll → Nothing happens
- Refresh → First tab always active

**After (working):**
- Manual click → Changes active tab + smooth scrolls
- Page load → Correct tab based on scroll position
- Scroll down → Next tab activates automatically
- Scroll up → Previous tab activates automatically  
- Refresh → Maintains correct tab based on position

## 🚀 You're Done!

If all tests pass, your FAQ navigation is now fully functional with:
- ✅ Scroll-based highlighting
- ✅ Smooth navigation
- ✅ Barba SPA compatibility
- ✅ Refresh persistence
- ✅ Mobile support

## Need Help?

Check these files for more details:
- `FAQ-NAVIGATION-FIX-INSTRUCTIONS.md` - Full technical explanation
- `WHAT-CHANGED.md` - Side-by-side code comparison
- `js/index-faq-fix.js` - Complete corrected function
