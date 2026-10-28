# Ayhm Mohammed Obeidat — Digital Frontier Engineering Portfolio

A custom-engineered developer portfolio for **Ayhm Mohammed Obeidat** (Computer Science graduate from Jordan University of Science and Technology, based in Irbid / Amman, Jordan), targeting **Junior .NET Backend Developer / Junior Software Engineer** roles.

**Live Website:** [https://ayhm325.github.io/](https://ayhm325.github.io/)  
**Repository:** [https://github.com/ayhm325/ayhm325.github.io](https://github.com/ayhm325/ayhm325.github.io)  
**Flagship System Repository:** [https://github.com/ayhm325/DVLD-WPF](https://github.com/ayhm325/DVLD-WPF)

---

## Creative Direction & Engineering Architecture

Designed around the **Digital Frontier** aesthetic—deep near-black and graphite surfaces (`#05070b`, `#080c13`, `#0c121d`), electric cyan (`#00f0ff`), and restrained ultraviolet (`#8b5cf6`) accents—built entirely with semantic HTML5, modern CSS3, and zero-dependency ES6+ JavaScript for fast GitHub Pages loading.

### Key Interactive Systems

1. **Interactive 3D Dimensional System Core (`#systemCoreCanvas`)**:
   - Real-time 3D-projected architectural topology visualizing the 5-layer DVLD .NET solution (`Presentation (WPF)`, `ASP.NET Core API`, `Application & Domain`, `EF Core & UoW`, `SQL Server`) plus `DTOs & Result` and `JWT & RateLimit` nodes.
   - Pointer-draggable 3D perspective with live telemetry packets and keyboard-accessible layer filtering.
2. **Keyboard-Accessible Engineering CLI (`ayhm@core:~$`)**:
   - Functional inspection shell supporting commands (`help`, `whoami`, `arch`, `dvld`, `tests`, `security`, `stack`, `contact`, `cv`, `goto`, `clear`), command history (`ArrowUp` / `ArrowDown`), clickable quick-command chips, and `/` global focus shortcut.
3. **"Inside the System" Layered .NET Architecture Workbench (`#architecture`)**:
   - Explorable schematic of the 5 verified layers (`Presentation`, `API`, `Application`, `Domain`, `Infrastructure`), `SQL Server` persistence, and `DTOs & Result Pattern` boundary.
   - Selecting any component reveals its verified responsibility, applied patterns, layer specification contract, and **Implementation & Verification Scope**.
4. **DVLD Flagship Case Study & Workflow Explorer (`#projects`)**:
   - End-to-end interactive trace of 4 verified DVLD business workflows:
     1. Authentication, Role-Based Authorization & Login Rate Limiting (`HTTP 429`)
     2. Driving License Applications & Test Appointments
     3. License Issuance, Renewal & Replacement Workflows
     4. License Detention, Release & International Licenses
   - Highlights the 4-pillar automated test coverage (`xUnit` & `Moq` covering application logic, API behavior, infrastructure operations, and security scenarios) and the Git/GitHub + Azure DevOps automated restore and build pipeline.
5. **Evidence-Backed Capabilities Matrix (`#skills`)**:
   - Organized across 8 core engineering categories with interactive domain filtering and concrete project evidence rather than arbitrary percentage scores.

---

## Repository Structure

- `index.html` — Semantic document structure, JSON-LD (`Person` & `SoftwareSourceCode`), Open Graph/Twitter metadata, and accessible interactive sections.
- `style.css` — Digital Frontier design system, responsive grid layouts (`320px` to `1920px+`), spotlight cards, and `prefers-reduced-motion` safeguards.
- `script.js` — 3D projection canvas, interactive CLI terminal, architecture workbench inspector, workflow explorer, skill filter, and pointer telemetry.
- `assets/ayhm-portrait.jpg` — Web-optimized primary portrait (`67.8 KB`, upright EXIF-corrected `560×840` JPEG) for fast Largest Contentful Paint (LCP).
- `assets/ayhmImage.JPG` — Original high-resolution portrait preserved untouched as fallback.
- `assets/Ayhm_Obeidat_CV.pdf` — Downloadable Curriculum Vitae PDF (preserved untouched).
- `assets/favicon.svg`, `assets/favicon.ico`, `assets/apple-touch-icon.png`, `assets/og-cover.png` — Brand icons and social preview cover.
- `site.webmanifest`, `robots.txt`, `sitemap.xml` — PWA manifest and search engine indexing configuration.

---

## Local Preview

Preview the site locally using Node.js:

```powershell
npx.cmd serve . -l 8080
```

Then open `http://localhost:8080` in your browser.
