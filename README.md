# Ayhm Obeidat Portfolio — Grand Line Code Edition

A pirate-adventure inspired portfolio for Ayhm Obeidat, a Computer Science graduate targeting Junior .NET Backend Developer / Junior Software Engineer roles. The visual direction keeps the ocean, navigation and manga-inspired identity while making the technical content the primary message.

## Included files

- `index.html` — semantic portfolio structure, SEO/social metadata, structured data and project content.
- `style.css` — responsive design system, visual effects, accessibility states and mobile layout.
- `script.js` — navigation, keyboard-friendly interactions, skill network, reveal effects, particles and motion controls.
- `site.webmanifest` — installable-site metadata.
- `robots.txt` — crawler rules and sitemap location.
- `sitemap.xml` — GitHub Pages sitemap.
- `assets/favicon.svg` — primary scalable favicon.
- `assets/favicon.ico` — legacy favicon fallback.
- `assets/apple-touch-icon.png` — iOS/home-screen icon.
- `assets/og-cover.png` — social sharing preview image.

## Existing personal assets

Keep the existing project assets in the repository:

- `assets/ayhmImage.JPG` — profile portrait used by the wanted-poster card.
- `assets/Ayhm_Obeidat_CV.pdf` — downloadable CV.

The current package does not replace those personal files because only the portfolio source files were provided for this revision.

## What was improved

### SEO and sharing

- Added canonical URL.
- Added Open Graph URL, image, dimensions and locale.
- Added Twitter/X preview image metadata.
- Added `Person` JSON-LD for the portfolio owner and public profile links.
- Added favicon, Apple touch icon and web manifest.
- Added `robots.txt` and `sitemap.xml`.
- Removed the unused JetBrains Mono web-font request.

### Accessibility and UX

- Preserved the skip link and reduced-motion support.
- Added strong `:focus-visible` states.
- Architecture layers are semantic buttons rather than generic focusable `div` elements.
- Mobile navigation now restores focus, supports Escape and keeps keyboard focus inside the open menu.
- Skill nodes support pointer, keyboard and click/touch interaction; clicking a skill can pin its details.
- Decorative cursor is hidden for coarse pointers and reduced-motion users.

### Visual polish

- Kept the existing pirate/ocean/manga identity rather than replacing it with a generic developer template.
- Simplified the custom cursor so it supports the theme without competing with the content.
- Added a clearer project-evidence block.
- Added an explicit availability line in the contact section.
- Removed duplicate route-map wording around DVLD.
- Kept technical claims centered on the documented DVLD architecture and capabilities.

### Performance

- Kept particle counts deliberately small and responsive to viewport size.
- Pauses animation while the page is hidden.
- Respects `prefers-reduced-motion`.
- Uses `requestAnimationFrame` for pointer/scroll motion work.
- Keeps the hero portrait stable with an explicit aspect ratio.
- Avoids adding unnecessary libraries or frameworks.

## Content source of truth

Technical claims were aligned to the provided portfolio source and its stated CV/DVLD evidence. The project is presented as a layered solution rather than as a generic Clean Architecture implementation. The documented runtime path is:

`Presentation → API → Application → Infrastructure → SQL Server`

`Domain` and `DVLD.Contracts` are presented as architectural boundaries rather than being incorrectly inserted into the runtime chain.

The portfolio retains the documented security, transaction, error-handling, testing and CI claims and labels the reported 1,487 passing tests as historical rather than a fresh execution result.

## Local preview

Run the site through a local web server so relative assets behave like GitHub Pages:

```powershell
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## GitHub Pages

Repository:

`https://github.com/ayhm325/ayhm325.github.io`

After replacing the files:

```powershell
git status
git add index.html style.css script.js README.md site.webmanifest robots.txt sitemap.xml assets/favicon.svg assets/favicon.ico assets/apple-touch-icon.png assets/og-cover.png
git commit -m "Polish portfolio accessibility SEO and performance"
git push origin main
```

After deployment, hard-refresh with `Ctrl + F5`.

## Final QA checklist

Before publishing, test:

- Chrome, Edge and Firefox.
- Mobile widths around 320, 375, 390 and 430px.
- Tablet widths around 768 and 1024px.
- Desktop widths around 1280, 1440 and 1920px.
- Keyboard-only navigation with Tab / Shift+Tab / Escape.
- Reduced-motion mode.
- CV download.
- GitHub and LinkedIn links.
- Profile image and favicon loading.
- Social preview image after deployment.
- No console errors in the browser developer tools.
