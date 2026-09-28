# Global Glassmorphism Standard

This file contains the strict rules for the Canteen App's glassmorphism aesthetic. Any new modules, cards, or popups added to the application MUST follow these exact Tailwind classes to maintain a unified look.

## Core Rules

1. **Base Opacity:** Always use `45%` opacity for the base color. Never use `70%`, `80%`, or solid gradients for main cards unless specifically requested.
2. **Light Bending (Refraction):** Glass doesn't just blur; it bends light. Always use `backdrop-saturate-[1.5]` alongside `backdrop-blur-xl`.
3. **Glass Bevel:** Always include an inset white shadow (`inset_0_1px_1px_rgba(255,255,255,0.8)`) to mimic light hitting the top edge of the glass, along with a subtle white border (`border-white/40`).

## The Standard Tailwind Class String

Copy and paste this exact string for any new main card, module, or modal:

```css
bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]
```

*(Optional): For hover states on clickable cards, add:*
```css
hover:-translate-y-1 hover:bg-[#F2EAE0]/60 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] transition-all
```

## Variations

### Darker Latte Panels (e.g., Headers, Sidebars)
If you need the slightly darker latte shade instead of the cream, swap the background color but keep the opacity and effects identical:
```css
bg-[#DCD0B6]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]
```

### Small Elements (Buttons, Tags, Inputs)
For smaller elements sitting *on top* of main glass cards, you can use slightly higher opacity or a stronger blur so they remain legible:
```css
bg-white/60 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]
```
