---
name: brand-ui-designer
description: A specialist skill for designing high-quality, accessible, and modern web/app user interfaces using strict brand design standards.
---

# Brand UI Designer Skill

## Context & Constraints
This skill is triggered when generating layout components, mockups, or production-ready frontend styles. Follow these strict brand guidelines to ensure absolute layout cohesion:

- **Color Palette:** Primary brand blue (`#1A365D`), secondary accent soft white (`#F7FAFC`), and text deep slate (`#2D3748`). NEVER use pure absolute blacks (`#000000`).
- **Typography:** Display headings must implement your custom display font, while primary interface bodies fall back onto standard system sans-serif strings.
- **Visual Depth:** Implement subtle Z-axis layering. Use glassmorphism variants (`backdrop-filter: blur()`) for modal sheets and dashboard panels over oversaturated neon glow effects.
- **Layout Constraints:** Maintain a clean 8px layout grid constraint for spacing, padding, and outer border radii.

## Workflow Execution Steps
1. **Auditing Phase:** When building a component, evaluate it side-by-side with your local specifications file. 
2. **Tool Integration:** If a Figma link or Token Stream is provided, prioritize ingested coordinate values and precise geometry mapping over generic placeholder elements.
3. **Accessibility (A11y):** Ensure all contrast combinations conform to modern digital accessibility definitions and semantic layout practices before serving layouts.
