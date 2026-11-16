# Ayhm Mohammed Obeidat — .NET Backend Developer Portfolio

Personal developer portfolio for **Ayhm Mohammed Obeidat**, a Computer Science graduate from Jordan University of Science and Technology (JUST) focused on C#, .NET 8, ASP.NET Core Web API, Entity Framework Core, SQL Server, and backend architecture.


---

## About

I am a **.NET Backend Developer** based in Amman, Jordan, focused on building structured RESTful APIs, maintainable layered architectures, and reliable data-driven backend workflows. This portfolio presents my technical skills, education, contact channels, and featured backend engineering work on the **DVLD** system.

---

## Technology Stack

Technologies actually used in this portfolio repository:

- **Astro** (`astro`, `@astrojs/check`) — static site generation and component architecture
- **TypeScript** — strict type checking across `.astro`, `.ts`, and `.tsx` files
- **React** (`react`, `react-dom`, `@astrojs/react`) — interactive client islands (`LetterGlitch`, `SkillsList`, `LikeButton`)
- **Tailwind CSS** (`tailwindcss`, `@astrojs/tailwind`) — utility-first styling
- **CSS & JavaScript** — custom keyframe animations, scroll-driven navbar transitions, and reduced-motion support
- **Firebase Firestore** *(optional)* — realtime counter backing `LikeButton` when configured, with automatic local-only fallback when environment variables are absent

---

## Project Structure

```text
public/
├── files/
│   └── AyhmObeidat_CV.pdf        # Downloadable CV PDF
├── fonts/                        # Self-hosted Montserrat Variable woff2 fonts
├── svg/                          # Technology SVG icons used in LogoWall & Footer
├── favicon.png
├── llms.txt
├── og.image.png
└── robots.txt
src/
├── React/
│   ├── LetterGlitch.tsx          # Canvas-based character matrix animation
│   ├── LikeButton.tsx            # Interactive like button (Firestore + local fallback)
│   └── SkillsList.tsx            # Interactive accordion for core backend focus
├── components/
│   ├── about.astro               # About Me section
│   ├── contact.astro             # Direct contact channels & CV download
│   ├── education.astro           # Academic background (JUST, B.Sc. CS 2026)
│   ├── footer.astro              # Footer links, stack badges, and LikeButton
│   ├── home.astro                # Hero section, LogoWall, SkillsList & LetterGlitch
│   ├── logoWall.astro            # Infinite horizontal technology marquee
│   ├── nav.astro                 # Floating glassmorphic navigation bar
│   ├── projects.astro            # Featured DVLD project showcase
│   └── skills.astro              # Categorized technical skills
├── data/
│   └── portfolio.ts              # Centralized personal, skills, education & DVLD data
├── layouts/
│   └── Layout.astro              # Base HTML layout, SEO/OG/Twitter/JSON-LD & theme tokens
├── pages/
│   ├── index.astro               # Main portfolio page (/)
│   └── projects/
│       └── dvld.astro            # Dedicated DVLD architecture & case study (/projects/dvld)
├── env.d.ts                      # Astro & React JSX directive type definitions
└── firebase.ts                   # Optional Firebase initialization
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20.0.0`
- **npm**

### Installation

```bash
npm install
```

---

## Development

Start the local development server:

```bash
npm run dev
```

---

## Production Build

Run TypeScript/Astro checks (`astro check`) and build the static site into `dist/`:

```bash
npm run build
```

---

## Preview

Preview the production build locally:

```bash
npm run preview
```

---

## Environment Variables

All environment variables are **optional**. The portfolio builds and runs completely without them.

If you want `LikeButton` in `src/React/LikeButton.tsx` to persist likes to Firebase Firestore instead of using local-only state, create a `.env` file based on `.env.example`:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

---

## Portfolio Sections

- **Home** (`#home`) — Developer identity, hero statement, CV download, technology marquee, interactive core-focus accordion, and canvas glitch animation.
- **About** (`#about`) — Computer Science background, backend focus, location, and languages.
- **Skills** (`#skills`) — Technical skills grouped into Backend Development, Database, Programming Fundamentals, API & Security, and Tools.
- **Projects** (`#projects`) — Featured DVLD showcase with architecture flow diagram and link to `/projects/dvld`.
- **Education** (`#education`) — B.Sc. in Computer Science at Jordan University of Science and Technology (JUST), 2026.
- **Contact** (`#contact`) — Direct email, phone, GitHub, and CV download actions.

---

## Featured Project

**DVLD — Driving & Vehicle License Department System**  
Repository: [https://github.com/ayhm325/DVLD-System](https://github.com/ayhm325/DVLD-System)  
Reference Commit: [`b3ba343f4f47d886a57869a8ed0a45f0d535329b`](https://github.com/ayhm325/DVLD-System/tree/b3ba343f4f47d886a57869a8ed0a45f0d535329b)

A multi-layered driving license management system built with .NET 8, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT authentication, and a React + TypeScript `ClientApp`, with unit/integration tests in xUnit and Azure DevOps CI.

---

## Contact

- **Email:** [ayhmobeidat.cs@gmail.com](mailto:ayhmobeidat.cs@gmail.com)
- **Phone:** [+962 788 234 055](tel:+962788234055)
- **Location:** Amman, Jordan
- **GitHub:** [https://github.com/ayhm325](https://github.com/ayhm325)

---

## License & Attribution

This project is customized from the open-source [dark-minimal](https://github.com/Gothsec/dark-minimal) template under the [MIT License](LICENSE).
