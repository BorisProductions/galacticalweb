# FAQ Navigation - How It Works (Visual Guide)

## 🔄 The Flow

```
USER LANDS ON FAQ PAGE
         ↓
    Page Loads
         ↓
   initFaq() runs
         ↓
    ┌──────────────────────────────────┐
    │  1. Setup accordion (open/close) │
    │  2. Setup flip buttons           │
    │  3. Create flip background       │
    └──────────────────────────────────┘
         ↓
    ┌──────────────────────────────────┐
    │  NEW: Create ScrollTriggers      │
    │  ─────────────────────────────   │
    │  For each FAQ section:           │
    │  • #faq-general                  │
    │  • #faq-process                  │
    │  • #faq-portal                   │
    │                                  │
    │  Each watches scroll position    │
    └──────────────────────────────────┘
         ↓
    ┌──────────────────────────────────┐
    │  NEW: Calculate initial state    │
    │  ─────────────────────────────   │
    │  Check: Which section is visible?│
    │  → Set that tab as active        │
    └──────────────────────────────────┘
         ↓
    ✅ FAQ READY!
```

## 📊 Scroll Detection Zones

```
┌─────────────────────────────────────────────┐
│  Viewport                                   │
│                                            │
│  ┌──────────────────────────────────────┐ │ ← 0% (top)
│  │                                      │ │
│  │                                      │ │
│  │  ══════════════════════════════════ │ │ ← 30% (TRIGGER ZONE)
│  │  ↑                                  │ │
│  │  │ When section crosses this line   │ │
│  │  │ → Tab becomes active             │ │
│  │  ↓                                  │ │
│  │                                      │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │ ← 100% (bottom)
└─────────────────────────────────────────────┘
```

## 🎬 Scroll Behavior

### Scrolling Down ⬇️

```
Step 1: User scrolls down
┌─────────────────┐
│ [General] ✓     │ ← Active
│ [Process]       │
│ [Portal]        │
└─────────────────┘

      ↓ Scroll ↓

Step 2: Process section enters trigger zone
┌─────────────────┐
│ [General]       │
│ [Process] ✓     │ ← Now Active (auto-switched)
│ [Portal]        │
└─────────────────┘
```

### Scrolling Up ⬆️

```
Step 1: User scrolls up
┌─────────────────┐
│ [General]       │
│ [Process] ✓     │ ← Active
│ [Portal]        │
└─────────────────┘

      ↑ Scroll ↑

Step 2: General section enters trigger zone from bottom
┌─────────────────┐
│ [General] ✓     │ ← Now Active (auto-switched)
│ [Process]       │
│ [Portal]        │
└─────────────────┘
```

## 🎯 Click Navigation

```
User clicks tab
      ↓
┌──────────────────────────┐
│ setActiveLink(index)     │
│ • Remove active from all │
│ • Add active to clicked  │
│ • Animate flip bg        │
└──────────────────────────┘
      ↓
┌──────────────────────────┐
│ Smooth scroll to section │
│ • Use Lenis if available │
│ • Fallback to native     │
└──────────────────────────┘
      ↓
   ✅ Done!
```

## 🔧 Technical Breakdown

### ScrollTrigger Setup

```javascript
ScrollTrigger.create({
  trigger: row,              // The FAQ section (#faq-general)
  start: "top 30%",          // When top hits 30% from top
  end: "bottom 30%",         // Until bottom hits 30%
  
  // Going down ↓
  onEnter: () => setActiveLink(index),        // Entering from top
  onLeave: () => setActiveLink(index + 1),    // Leaving from bottom
  
  // Going up ↑
  onEnterBack: () => setActiveLink(index),    // Entering from bottom
  onLeaveBack: () => setActiveLink(index - 1) // Leaving from top
});
```

### Visual Representation

```
Section: #faq-general (index 0)

Viewport    Section Position       Callback Triggered
─────────   ───────────────────   ──────────────────────
   ↓        Above viewport        (nothing)
   ↓        ═════════════════     onEnter → activate tab 0
   ↓        Inside viewport       (stays active)
   ↓        ═════════════════     onLeave → activate tab 1
   ↓        Below viewport        (tab 1 active)
   ↑        Below viewport        (tab 1 active)
   ↑        ═════════════════     onEnterBack → activate tab 0
   ↑        Inside viewport       (stays active)
   ↑        ═════════════════     onLeaveBack → activate tab -1 (none)
```

## 🎨 Flip Animation

```
Before Click/Scroll:
┌──────────────────────────────────┐
│ [General] ██                     │ ← bg element here
│ [Process]                        │
│ [Portal]                         │
└──────────────────────────────────┘

Step 1: Flip.getState(bg)
         ↓
    Record position

Step 2: bg.appendChild to new button
┌──────────────────────────────────┐
│ [General]                        │
│ [Process] ██                     │ ← bg moved instantly
│ [Portal]                         │
└──────────────────────────────────┘

Step 3: Flip.from(state)
         ↓
    Animate from old position to new

Result: Smooth slide animation! ✨
```

## 📱 Lifecycle Events

### Direct Load (Refresh on FAQ page)

```
1. DOMContentLoaded
   ↓
2. initFaq() runs
   ↓
3. ScrollTriggers created
   ↓
4. gsap.delayedCall(0.2) ← Wait for layout
   ↓
5. Calculate scroll position
   ↓
6. setActiveLink(correctIndex)
   ↓
✅ Correct tab is active
```

### Barba Navigation (From Home → FAQ)

```
1. User clicks FAQ link
   ↓
2. barba.hooks.beforeLeave
   • Kill old ScrollTriggers
   • Stop Lenis
   ↓
3. barba.hooks.enter
   • Scroll to top
   ↓
4. barba.hooks.afterEnter
   • initGeneral(next)
   • initFaq(next) ← Our function!
   ↓
5. ScrollTriggers created
   ↓
6. Initial state calculated
   ↓
✅ FAQ page ready with correct tab
```

## 🐛 Edge Cases Handled

### Case 1: No sections visible
```javascript
if (!rows.length) return;
// Prevents errors when no FAQ sections exist
```

### Case 2: Index out of bounds
```javascript
const safeIndex = Math.max(0, Math.min(activeIndex, buttons.length - 1));
// Clamps index: 0 ≤ index ≤ max
```

### Case 3: Flip not loaded
```javascript
if (window.Flip && bg) {
  try {
    // Flip animation
  } catch(e) {}
}
// Gracefully degrades if Flip plugin missing
```

### Case 4: Lenis not available
```javascript
if (typeof lenis !== 'undefined' && lenis && lenis.scrollTo) {
  lenis.scrollTo(target, { offset: -120 });
} else {
  target.scrollIntoView({ behavior: 'smooth' });
}
// Falls back to native smooth scroll
```

## 💡 Why It Works

### The Problem (Old Code)
```
[User scrolls] → Nothing happens
[Tab clicked] → Tab highlights
```
**Issue**: Only manual interaction updated tabs

### The Solution (New Code)
```
[User scrolls] → ScrollTrigger fires → Tab highlights
[Tab clicked] → Tab highlights + smooth scroll
```
**Result**: Both manual and automatic updates work!

## 📚 Key Concepts

1. **ScrollTrigger**: GSAP plugin that fires callbacks based on scroll position
2. **Flip**: GSAP plugin that animates element position changes smoothly
3. **setActiveLink()**: Central function that updates tab state
4. **Trigger Zone**: The 30% mark where sections become "active"
5. **Bidirectional**: Works both scrolling down and up
6. **Initial State**: Calculated on load, not hardcoded to first tab

## ✨ The Magic

```javascript
// This is what makes it work!
ScrollTrigger.create({
  trigger: section,
  onEnter: () => highlight(),      // ↓
  onEnterBack: () => highlight(),  // ↑
});

// Runs on EVERY scroll, not just clicks!
```

---

**Remember**: The old code only responded to clicks. The new code responds to **both** clicks and scrolling, making it work seamlessly regardless of how the user navigates! 🎉
