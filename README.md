# Ayhm Obeidat Portfolio — Grand Line Code Edition

A pirate-adventure inspired portfolio for Ayhm Obeidat, a Computer Science graduate targeting Junior .NET Backend Developer roles. The content is grounded in the DVLD project and the attached CV, while the visual direction combines ocean/navigation motifs, manga-style typography, wanted-poster treatment, programming symbols, and backend architecture.

## Files

- `index.html` — semantic portfolio structure and content
- `style.css` — responsive visual system, animations, accessibility states, and decorative world elements
- `script.js` — interactions, particle atmosphere, navigation, skills network, reveal effects, cursor, and performance controls

## Assets expected

- `assets/ayhmImage.JPG`
- `assets/Ayhm_Obeidat_CV.pdf`

## Improvements in this revision

This revision is a final polish pass focused on layout balance, interaction cost, responsive behavior, and accessibility consistency.

- Fixed the mismatch between the HTML `pirate-cursor` markup and the previous cursor CSS/JS implementation.
- Reworked the cursor into a lightweight compass-style interaction that follows the pointer smoothly.
- Consolidated magnetic-button and 3D-tilt animation work into a shared animation loop instead of creating one `requestAnimationFrame` loop per element.
- Batched scroll-progress updates with `requestAnimationFrame`.
- Added the missing BUILD route to navigation and synchronized `aria-current` state.
- Reworked pointer tracking to update the cursor with GPU-friendly transforms instead of `left/top`.
- Replaced repeated magnetic/tilt array lookups with `WeakMap` element lookup.
- Prevented particle pointer forces from running before the pointer is active.
- Added `ResizeObserver` support for the skills network so connector lines follow layout changes more reliably.
- Added earlier navigation collapse and tighter tablet/mobile spacing to prevent cramped layouts.
- Tuned the hero, route map, skills board, architecture map, and contact layout for small screens.
- Added lightweight paint containment for decorative layers and the particle canvas.
- Replaced repeated section-position scanning with `IntersectionObserver` for active navigation.
- Paused particle animation when the document is hidden and respected `prefers-reduced-motion`.
- Throttled resize work through one animation-frame callback.
- Added keyboard support and visible focus states to the architecture route layers.
- Added missing pirate/ocean decorative styles that were present in the HTML but had no corresponding CSS.
- Added a graceful profile-image fallback without inline event-handler JavaScript.
- Improved mobile navigation with Escape and outside-click closing.
- Kept decorative canvas interaction non-interactive so it cannot block clicks.
- Reworked the portfolio copy around the CV and the DVLD state represented by commit `1fa548768dbd097efbb271b2fc64466536262191`.
- Replaced generic architecture wording with the project's documented layered structure, shared `DVLD.Contracts` boundary, transactional Unit of Work, security controls, testing, and Azure DevOps CI.
- Updated the skills network to emphasize C#, ASP.NET Core Web API, SQL Server, EF Core, REST, JWT, DI/UoW, and testing.
- Avoided claiming a generic "Clean Architecture" label where the project documentation describes a layered solution.
- Preserved the portfolio's overall pirate/.NET visual identity while making the engineering content more specific.

## Run locally

Open `index.html` through a local web server so relative assets load consistently. For example with Python:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

Repository: `ayhm325/ayhm325.github.io`

After replacing the files:

```powershell
git status
git add index.html style.css script.js README.md
git commit -m "Optimize portfolio interactions and performance"
git push origin main
```

After deployment, hard-refresh the site with `Ctrl + F5`.
