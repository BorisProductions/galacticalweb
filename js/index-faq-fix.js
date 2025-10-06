// FAQ NAVIGATION FIX
// Replace the initFaq function in your index.js with this corrected version

function initFaq(container) {
  if (!container || container.__faqInit) return; // idempotent
  container.__faqInit = true;

  const faqs = container.querySelectorAll('.faq-item');

  // Simple accordion functionality
  faqs.forEach(faq => {
    const link = faq.querySelector('.faq-link');
    const content = faq.querySelector('.faq-content');
    const lines = faq.querySelectorAll('.single-line');
    if (!link || !content) return;

    link.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();

      // Close others
      faqs.forEach(other => {
        if (other !== faq && other.getAttribute('data-state') === 'open') {
          const inner = other.querySelector('.faq-link');
          if (inner) inner.click();
        }
      });

      const opening = faq.getAttribute('data-state') === 'closed';
      faq.setAttribute('data-state', opening ? 'open' : 'closed');

      if (opening) {
        gsap.to(content, { height: 'auto', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo(lines, { y: '120%' }, { y: '0%', stagger: 0.05, delay: 0.05 });
      } else {
        gsap.to(content, { height: 0, duration: 0.65, onComplete: () => ScrollTrigger.refresh() });
      }
    }, { passive: false });
  });

  // Tab buttons with Flip highlight - Webflow workaround for CMS list
  const buttons = container.querySelectorAll('[data-flip-button="button"]');
  if (!buttons.length) return;

  // Ensure first button is active
  if (!container.querySelector('[data-flip-button="button"].active') && buttons[0]) {
    buttons[0].classList.add('active');
  }

  // Create or find the flip background element
  let bg = container.querySelector('[data-flip-button="bg"]');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'tab-button__bg';
    bg.setAttribute('data-flip-button', 'bg');
    const firstActive = container.querySelector('[data-flip-button="button"].active') || buttons[0];
    firstActive.appendChild(bg);
  }

  // Scroll-based navigation highlighting (THE KEY FIX)
  const rows = container.querySelectorAll("[data-faq-nav='row']");
  const links = container.querySelectorAll("[data-faq-nav='link']");

  function setActiveLink(activeIndex) {
    // Clamp index to valid range
    const safeIndex = Math.max(0, Math.min(activeIndex, buttons.length - 1));
    
    // Update button states
    buttons.forEach((btn, index) => {
      if (index === safeIndex) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Animate flip background to active button
    if (window.Flip && bg) {
      try {
        const activeButton = buttons[safeIndex];
        if (activeButton && !activeButton.contains(bg)) {
          const state = Flip.getState(bg);
          activeButton.appendChild(bg);
          Flip.from(state, { duration: 0.4, ease: "power2.out" });
        }
      } catch(e) {
        // Silently fail if Flip isn't available
      }
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
          // When scrolling down past this section, activate next if exists
          if (index < rows.length - 1) {
            setActiveLink(index + 1);
          }
        },
        onLeaveBack: () => {
          // When scrolling up past this section, activate previous if exists
          if (index > 0) {
            setActiveLink(index - 1);
          }
        }
      });
    });
  }

  // Manual tab click handlers (for button navigation)
  buttons.forEach((button, index) => {
    const innerLink = button.querySelector('[data-faq-nav="link"]');
    
    button.addEventListener('click', function(e) {
      // Don't prevent default if clicking directly on an anchor
      if (e.target.tagName !== 'A') {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
      }
      
      setActiveLink(index);
      
      // Smooth scroll to corresponding section
      if (innerLink) {
        const href = innerLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = container.querySelector(href);
          if (target) {
            // Use lenis for smooth scroll if available
            if (typeof lenis !== 'undefined' && lenis && lenis.scrollTo) {
              lenis.scrollTo(target, { offset: -120, duration: 1 });
            } else {
              // Fallback to native scroll
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      }
    });
  });

  // Set initial active state based on current scroll position
  // Use a small delay to ensure layout is ready
  gsap.delayedCall(0.2, () => {
    if (!rows.length) return;
    
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    let activeIdx = 0;
    
    // Find which section is currently in the trigger zone
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
