# Ayhm Mohammed Obeidat — Digital Frontier Engineering Portfolio

A custom-engineered developer portfolio for **Ayhm Mohammed Obeidat** (Computer Science graduate from Jordan University of Science and Technology, based in Irbid, Jordan), targeting **Junior .NET Backend Developer / Junior Software Engineer** roles.

**Live Website:** [https://ayhm325.github.io/](https://ayhm325.github.io/)  
**Repository:** [https://github.com/ayhm325/ayhm325.github.io](https://github.com/ayhm325/ayhm325.github.io)  
**Flagship System Repository:** [https://github.com/ayhm325/DVLD-WPF](https://github.com/ayhm325/DVLD-WPF)

---

## Creative Direction & Engineering Architecture

Designed around the **Digital Frontier** aesthetic—deep near-black and graphite surfaces (`#05070b`, `#080c13`, `#0c121d`), electric cyan (`#00f0ff`), and restrained ultraviolet (`#8b5cf6`) accents—built entirely with semantic HTML5, modern CSS3, and zero-dependency ES6+ JavaScript for instantaneous GitHub Pages loading.

### Key Interactive Systems

1. **Interactive 3D Dimensional System Core (`#systemCoreCanvas`)**:
   - Real-time 3D-projected architectural topology visualizing the 5-layer .NET runtime path (`WPF MVVM` → `ASP.NET Core API` → `Application Core` → `EF Core 8 / UoW` → `SQL Server`) plus `DVLD.Contracts` and `JWT + RateLimit` nodes.
   - Pointer-draggable 3D perspective with live telemetry packets and keyboard-accessible layer filtering.
2. **Keyboard-Accessible Engineering CLI (`ayhm@core:~$`)**:
   - Functional inspection shell supporting commands (`help`, `whoami`, `arch`, `dvld`, `tests`, `security`, `stack`, `contact`, `cv`, `goto`, `clear`), command history (`ArrowUp` / `ArrowDown`), clickable quick-command chips, and `/` global focus shortcut.
3. **"Inside the System" Layered .NET Architecture Workbench (`#architecture`)**:
   - Explorable schematic of the 7 architectural layers and boundaries (`API`, `Application`, `Infrastructure`, `Database`, `Presentation`, `Domain`, `DVLD.Contracts`).
   - Selecting any component reveals its verified responsibility, key engineering trade-offs, C# implementation pattern, and **Implemented in Repo vs. Planned Evolution**.
4. **DVLD Flagship Case Study & Workflow Simulator (`#projects`)**:
   - End-to-end interactive trace of 4 real DVLD business workflows:
     1. Authentication & IP Login Rate Limiting (`5 requests / IP / minute` returning `HTTP 429 ProblemDetails`)
     2. Sequential Test Appointment Workflow (`Vision → Written → Street`)
     3. First-Time License Issuance under a Shared Scoped `DbContext` & `Serializable` Unit of Work Transaction
     4. License Detention, Release, Renewal & Replacement Rules
   - Visual breakdown of the **1,487 historically reported passing automated tests** (`631` unit, `364` API integration, `492` infrastructure tests with `xUnit` and `Moq`) and Azure DevOps CI build pipeline.
5. **Evidence-Backed Capabilities Matrix (`#skills`)**:
   - Organized across 8 core engineering categories with interactive domain filtering and concrete project evidence rather than arbitrary percentage scores.

---

## Repository Structure

- `index.html` — Semantic document structure, JSON-LD (`Person` & `SoftwareSourceCode`), Open Graph/Twitter metadata, and accessible interactive sections.
- `style.css` — Digital Frontier design system, responsive grid layouts (`320px` to `1920px+`), spotlight cards, and `prefers-reduced-motion` safeguards.
- `script.js` — 3D projection canvas, interactive CLI terminal, architecture workbench inspector, workflow simulator, skill filter, and pointer telemetry.
- `assets/ayhm-portrait.jpg` — Web-optimized portrait (`67 KB`, upright EXIF-corrected `560×840` JPEG) for fast Largest Contentful Paint (LCP).
- `assets/ayhmImage.JPG` — Original high-resolution portrait preserved intact as fallback.
- `assets/Ayhm_Obeidat_CV.pdf` — Downloadable Curriculum Vitae PDF.
- `assets/favicon.svg`, `assets/favicon.ico`, `assets/apple-touch-icon.png`, `assets/og-cover.png` — Brand icons and social preview cover.
- `site.webmanifest`, `robots.txt`, `sitemap.xml` — PWA manifest and search engine indexing configuration.

---

## Local Preview

Because Node.js is installed on Windows, you can preview the site locally with zero global installations using `npx serve` or a lightweight Node static server:

```powershell
npx.cmd serve . -l 8080
```

Or if Python is available in your PATH:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.
