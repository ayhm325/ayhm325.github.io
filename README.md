# Ayhm Mohammed Obeidat | .NET Backend Developer

Personal developer portfolio showcasing my technical background, backend development skills, education, and software engineering projects.

**Live Portfolio:** [https://ayhm325.github.io/](https://ayhm325.github.io/)

---

## About Me

I am **Ayhm Mohammed Obeidat**, a Computer Science graduate from **Jordan University of Science and Technology (JUST)**, based in **Amman, Jordan**.

My primary professional focus is **.NET Backend Development**, with an interest in building reliable RESTful APIs, maintainable software architectures, secure authentication systems, and data-driven applications.

My main technical focus includes:

- C# and .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- LINQ
- RESTful API Design
- JWT Authentication
- Layered Architecture

This portfolio presents my technical skills, academic background, and featured software engineering work.

---

## Portfolio Overview

The website includes:

- **Home:** Professional introduction, hero section, interactive elements, and technology showcase.
- **About:** Background, professional focus, location, and languages.
- **Technical Skills:** Categorized technical skills and learning paths.
- **Projects:** Featured DVLD project and its technical overview.
- **Education:** Academic background at JUST.
- **Contact:** Direct communication channels and downloadable CV.

---

## Technology Stack

Technologies used to build this portfolio:

| Technology | Purpose |
| --- | --- |
| **Astro** | Static site generation and component architecture |
| **TypeScript** | Type-safe development |
| **React** | Interactive client-side components |
| **Tailwind CSS** | Utility-first styling |
| **GSAP** | Smooth glyph and text reveal animations |
| **WebGL2 & Canvas** | Custom interactive backgrounds, borders, and physics effects |
| **CSS & JavaScript** | Custom styling, animations, and browser functionality |
| **Firebase Firestore (Optional)** | Persistent `LikeButton` functionality when configured |

---

## Interactive Components

The portfolio includes custom interactive components:

- **MagicRings:** Full-viewport WebGL2 expanding background rings on desktop screens.
- **MaskedHeading:** GSAP-powered masked typography with parallax, drift, and animated cloud texture.
- **FallingText:** Interactive physics-based text with cursor push, drag, and auto-restore.
- **ShinyText:** Animated metallic/gradient sweep text for section labels.
- **Folder & SkillsList:** Interactive neon-bordered 3D folder for Core Focus cards.
- **ElectricBorder & ElectricLine:** Animated neon canvas borders and section dividers.
- **SpecularButton:** Pointer-tracking specular highlight buttons and badges.
- **LetterGlitch:** Canvas-based animated character background.
- **LikeButton:** Interactive red specular like button with optional Firebase Firestore integration.
- **LogoWall:** Continuous horizontal technology marquee.
- **PillNav:** Floating glassmorphism navigation with pill hover fill and scroll-based effects.

---

## Technical Skills

My skills are organized around my primary professional direction.

### Backend Development

- C#
- .NET 8
- ASP.NET Core Web API
- REST APIs
- Entity Framework Core
- LINQ

### Database

- SQL Server
- SQL Queries
- Database Relationships
- JOINs
- GROUP BY
- Subqueries

### Programming Fundamentals

- Object-Oriented Programming
- SOLID Principles
- Dependency Injection
- Collections
- Async/Await

### API & Security

- HTTP Methods
- HTTP Status Codes
- JWT Authentication
- Role-Based Authorization

### Tools

- Git
- GitHub
- Visual Studio
- Visual Studio Code
- SQL Server Management Studio
- Swagger / OpenAPI

### Frontend Development — Learning Path

Frontend development is part of my planned learning journey and future skill development.

Technologies planned for this learning path:

- HTML5
- CSS3
- JavaScript
- TypeScript
- React
- Tailwind CSS
- Vite

> This section represents future learning goals and does not indicate professional mastery of these technologies.

---

## Featured Project

### DVLD — Driving & Vehicle License Department System

A driving and vehicle license management system designed to manage licensing workflows and related administrative operations.

- **Repository:** [DVLD-System](https://github.com/ayhm325/DVLD-System)
- **Detailed Overview:** [DVLD Case Study](https://ayhm325.github.io/projects/dvld/)

**Project Technologies:**

- C# / .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- React
- TypeScript
- JWT Authentication
- xUnit

**Architecture and Engineering Focus:**

- Layered architecture
- Separation of concerns
- Repository and Unit of Work patterns
- Transaction management
- Authentication and authorization
- Data validation and business workflows
- Unit and integration testing

The project includes a dedicated frontend application (`ClientApp`) that communicates with the backend through HTTP APIs.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/ayhm325/ayhm325.github.io.git
```

Navigate to the project directory:

```bash
cd ayhm325.github.io
```

Install dependencies:

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

The development server runs at:

```text
http://localhost:4321
```

### Production Build

Run the project checks and generate the production build:

```bash
npm run build
```

The generated static website is placed in:

```text
dist/
```

### Preview

Preview the generated production build locally:

```bash
npm run preview
```

---

## Environment Variables

Firebase integration is optional.

The portfolio works without Firebase configuration. When Firebase environment variables are configured, the `LikeButton` can use Firestore for persistent functionality; otherwise, it falls back to local-only behavior.

Create a `.env` file using the following variables:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

Do not commit actual credentials or private configuration values.

---

## Deployment

The portfolio is hosted using **GitHub Pages**.

The deployment workflow uses **GitHub Actions** to:

1. Install project dependencies.
2. Run the Astro production build (`astro check && astro build`).
3. Generate the static website in `dist/`.
4. Upload the generated build artifact.
5. Deploy the artifact to GitHub Pages.

**Live website:** [https://ayhm325.github.io/](https://ayhm325.github.io/)

---

## Contact

Feel free to reach out through the following channels:

- **Email:** [ayhmobeidat.cs@gmail.com](mailto:ayhmobeidat.cs@gmail.com)
- **Phone:** +962 788 234 055
- **Location:** Amman, Jordan
- **GitHub:** [github.com/ayhm325](https://github.com/ayhm325)

### Download CV

- [Download My CV](https://ayhm325.github.io/files/AyhmObeidat_CV.pdf)
