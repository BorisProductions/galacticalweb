# FAQ Navigation Fix Instructions

## Problem
The FAQ navigation wasn't properly highlighting active sections when scrolling, and didn't work reliably after page refresh or when navigating from home.

## Solution
The `initFaq` function needed to properly set up ScrollTriggers for scroll-based navigation.

## What Changed

### Key Improvements:
1. **Scroll-based highlighting**: Added ScrollTriggers that watch each FAQ section
2. **Bidirectional navigation**: Handles both scrolling down (onEnter/onLeave) and up (onEnterBack/onLeaveBack)
3. **Initial state**: Sets correct active tab based on scroll position on page load
4. **Manual navigation**: Click handlers scroll to sections smoothly
5. **Safe index bounds**: Prevents errors when switching between sections

### How to Apply the Fix

**Option 1: Replace the entire function**

In your `js/index.js` file, find the `initFaq` function (around line 1150-1250) and replace it with the corrected version from `js/index-faq-fix.js`.

The function should look like this:

```javascript
function initFaq(container) {
  if (!container || container.__faqInit) return;
  container.__faqInit = true;

  const faqs = container.querySelectorAll('.faq-item');

  // ... accordion code ...

  // === THE KEY ADDITION ===
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

  // Manual tab click handlers
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

  // Set initial active state
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
}
```

## What Was Removed

The old code had this incomplete implementation:
```javascript
// Old (incomplete) - only handled button hover/focus
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
```

## Testing

After applying the fix, test these scenarios:

1. **Direct load**: Go directly to `/faq.html` - the correct section should be highlighted based on scroll position
2. **From home**: Navigate from home page to FAQ - highlighting should work
3. **Scroll behavior**: Scroll through FAQ sections - active tab should update as you scroll
4. **Click navigation**: Click tabs - should smooth scroll to sections and update highlight
5. **Refresh**: Refresh while on FAQ page - should maintain correct active state

## Technical Details

### HTML Requirements
Your HTML should have this structure:

```html
<div data-faq-nav="filters">
  <button data-flip-button="button">
    <a data-faq-nav="link" href="#faq-general"></a>
    General
  </button>
  <button data-flip-button="button">
    <a data-faq-nav="link" href="#faq-process"></a>
    Process
  </button>
  <!-- more buttons -->
</div>

<div id="faq-general" data-faq-nav="row">
  <!-- FAQ items -->
</div>
<div id="faq-process" data-faq-nav="row">
  <!-- FAQ items -->
</div>
```

### How It Works

1. **ScrollTriggers**: Created for each `[data-faq-nav="row"]` section
2. **Trigger zone**: When section enters 30% from top of viewport
3. **Active state**: Managed by `setActiveLink()` function
4. **Flip animation**: GSAP Flip animates the background highlight between buttons
5. **Initial state**: Calculated after short delay to ensure layout is ready
6. **Smooth scroll**: Uses Lenis if available, falls back to native smooth scroll

## Dependencies

Make sure these are loaded (already in your HTML):
- GSAP
- ScrollTrigger
- Flip
- Lenis (for smooth scrolling)
- Barba (for SPA navigation)

## Barba Integration

The fix works with Barba's lifecycle:
- `afterEnter` hook calls `initFaq(data.next.container)`
- Direct load is handled by DOMContentLoaded event
- ScrollTriggers are properly cleaned up on page transitions
