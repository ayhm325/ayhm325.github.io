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

This revision is a content-and-engineering audit against the attached CV and the DVLD repository state represented by commit `1fa548768dbd097efbb271b2fc64466536262191`.

- Corrected the architecture wording to **layered solution / layered architecture** rather than claiming a generic Clean Architecture implementation.
- Removed the unsupported-looking `6 PROJECTS` route-map claim; the portfolio now presents DVLD as the flagship project documented in the CV.
- Corrected the architecture visualization so the runtime path is Presentation → API → Application → Infrastructure → SQL Server, while Domain and `DVLD.Contracts` are shown as architectural boundaries rather than incorrectly placed in the runtime chain.
- Added documented security details: JWT bearer authentication, policy-based authorization, BCrypt password hashing, and login rate limiting.
- Added the documented rate-limit configuration: 5 requests per IP in a 1-minute fixed window with HTTP 429 on excess requests.
- Added the documented transaction model: shared scoped `DVLDDbContext` / Unit of Work and Serializable isolation for concurrency-sensitive workflows.
- Added the documented API error boundary: global exception handling and ProblemDetails.
- Added the documented testing picture and clearly labels the 1,487 passing tests as a **historical reported result**, not a fresh execution claim.
- Kept Azure DevOps wording at Continuous Integration scope; no production deployment/CD claim is made.
- Preserved the pirate/ocean/manga visual identity while tightening the technical language around the actual project.

## Content source of truth

Portfolio technical claims were aligned to:
- The attached CV: C#, .NET, ASP.NET Core Web API, EF Core, SQL Server, LINQ, REST, layered architecture, SOLID, DI, Repository, Unit of Work, Result Pattern, JWT, role-based authorization, rate limiting, global exception handling, ProblemDetails, xUnit, unit/integration testing, WPF/MVVM and Azure DevOps.
- DVLD repository documentation and implementation at commit `1fa548768dbd097efbb271b2fc64466536262191`, including the documented layered boundaries, `DVLD.Contracts`, shared scoped DbContext/Unit of Work, transaction handling, security model, test suites and CI flow.

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
