# Copy This Entire Block and Paste Into VS Code AI

---

In the file `js/index.js`, I need you to fix the `initFaq` function to add scroll-based navigation. Here's what needs to change:

## Current Problem
The FAQ navigation tabs only highlight when clicked manually. They don't update when scrolling through sections or on page refresh.

## What to Do

### 1. FIND this function (around line 1150-1250):
```javascript
function initFaq(container) {
```

### 2. LOCATE this section inside the function (after the accordion code):
```javascript
  // Tab buttons with Flip highlight
  const buttons = container.querySelectorAll('[data-flip-button="button"]');
  if (!buttons.length) return;

  if (!container.querySelector('[data-flip-button="button"].active') && buttons[0]) {
    buttons[0].classList.add('active');
  }

  let bg = container.querySelector('[data-flip-button="bg"]');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'tab-button__bg';
    bg.setAttribute('data-flip-button', 'bg');
    buttons[0].appendChild(bg);
  }
```

### 3. FIND AND DELETE these lines (if they exist):
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

  initFlipHighlight();

  // Tab click handlers
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      initFlipHighlight();
    });
  });
```

### 4. ADD this complete new section right after the `bg` element creation:
```javascript
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
```

### 5. FINAL STRUCTURE
After your changes, the `initFaq` function should have this structure:

```javascript
function initFaq(container) {
  if (!container || container.__faqInit) return;
  container.__faqInit = true;

  const faqs = container.querySelectorAll('.faq-item');

  // [KEEP] Accordion functionality (FAQ open/close)
  faqs.forEach(faq => {
    // ... existing accordion code ...
  });

  // [KEEP] Tab buttons with Flip highlight setup
  const buttons = container.querySelectorAll('[data-flip-button="button"]');
  if (!buttons.length) return;

  if (!container.querySelector('[data-flip-button="button"].active') && buttons[0]) {
    buttons[0].classList.add('active');
  }

  let bg = container.querySelector('[data-flip-button="bg"]');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'tab-button__bg';
    bg.setAttribute('data-flip-button', 'bg');
    const firstActive = container.querySelector('[data-flip-button="button"].active') || buttons[0];
    firstActive.appendChild(bg);
  }

  // [NEW] Everything from step 4 goes here
  // Scroll-based navigation highlighting
  const rows = container.querySelectorAll("[data-faq-nav='row']");
  // ... rest of the new code ...
}
```

## What This Fix Does
1. **Adds ScrollTriggers** - Watches each FAQ section as you scroll
2. **Auto-highlights tabs** - Updates active tab when section enters viewport
3. **Handles initial state** - Sets correct tab on page load/refresh
4. **Smooth scrolling** - Clicking tabs smoothly scrolls to sections
5. **Bidirectional** - Works scrolling both up and down

## After Making Changes
Test these scenarios:
- Navigate to /faq.html directly → correct tab should be highlighted
- Scroll through sections → tabs should update automatically
- Click tabs → should smooth scroll to sections
- Refresh page while scrolled down → correct tab stays highlighted
- Navigate from home → should work correctly

Please make these changes now.
