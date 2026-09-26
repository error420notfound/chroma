# Disclosure, reveal, and transition on the web

## Progressive disclosure

Separate what a visitor must know to decide from what they can inspect on demand. Leave the value proposition, material terms, primary action, and essential product facts easy to find. Use tabs, accordions, comparison panels, “see details,” or staged forms only when they reduce complexity without creating an information hunt. Label each control by the content it reveals. Do not put indispensable content behind hover, a vague icon, inaccessible carousel, or motion-only reveal. For web implementation, use appropriate semantic elements, expose expanded state, support keyboard and touch, preserve meaningful content order, and avoid unexpectedly collapsing content during reading.

## Motion roles

| Role | Useful behavior | Avoid |
| --- | --- | --- |
| Feedback | Confirm option selection, cart update, validation | Delaying the action until an animation finishes |
| Spatial continuity | Connect thumbnail to detail or overlay to origin | Teleporting focus or obscuring changed content |
| Guided reveal | Introduce a section or expand its details after explicit intent | Scroll-jacking or making text wait to appear |
| Brand expression | A short, meaningful accent that reinforces tone | Always-on loops competing with reading and buying |

For each proposed animation, specify trigger, initial and final state, affected content, interaction during motion, and fallback. Use opacity/transform effects judiciously when implementing; avoid expensive effects when they impair responsiveness. On reduced-motion preference, remove nonessential movement and preserve feedback by immediate state changes. Keep essential information in the document even if animation fails or scripts are unavailable. Ensure keyboard focus and assistive-technology announcements reflect the final state. Test at mobile and desktop sizes and with touch, keyboard, and reduced motion.

## Concept-image caveat

A static image can show a state before or after a reveal, but not prove timing, scroll behavior, accessibility, or performance. Document interaction separately. Do not put multiple contradictory states in a single frame unless making an explicit comparison.
