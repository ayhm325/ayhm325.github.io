export interface SkillGroup {
  title: string;
  statusLabel?: string;
  items: string[];
}

export interface ArchitectureLayer {
  name: string;
  project: string;
  description: string;
}

export const personalInfo = {
  fullName: "Ayhm Mohammed Obeidat",
  shortName: "Ayhm",
  title: ".NET Backend Developer",
  location: "Amman, Jordan",
  email: "ayhmobeidat.cs@gmail.com",
  phone: "+962 788 234 055",
  phoneHref: "tel:+962788234055",
  emailHref: "mailto:ayhmobeidat.cs@gmail.com",
  github: "https://github.com/ayhm325",
  cvPath: "/files/AyhmObeidat_CV.pdf",
  cvFileName: "AyhmObeidat_CV.pdf",
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Working Proficiency" },
  ],
  profileSummary:
    "Computer Science graduate from Jordan University of Science and Technology (JUST) with a foundation in C# and .NET development. Hands-on experience building ASP.NET Core Web APIs using Entity Framework Core, SQL Server, LINQ, and REST principles. Familiar with Object-Oriented Programming, database design, and JWT authentication. Seeking a Junior .NET Backend Developer position.",
};

export const heroContent = {
  heading: "Building Reliable Backend Systems with .NET.",
  supportingText:
    "I'm Ayhm, a Computer Science graduate and .NET Backend Developer focused on building structured REST APIs, reliable data-driven applications, and secure backend workflows.",
};

export const aboutContent = {
  title: "About Me",
  paragraphs: [
    "I'm a Computer Science graduate from Jordan University of Science and Technology, focused on backend development with C# and .NET.",
    "I enjoy designing structured application architectures, building RESTful APIs, working with relational databases, and implementing business logic that is maintainable and reliable.",
    "My main practical project is DVLD, a driving and vehicle licensing management system built using .NET technologies.",
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend Development",
    items: [
      "C#",
      ".NET 8",
      "ASP.NET Core Web API",
      "REST APIs",
      "Entity Framework Core",
      "LINQ",
    ],
  },
  {
    title: "Database",
    items: [
      "SQL Server",
      "SQL Queries",
      "Database Relationships",
      "JOINs",
      "GROUP BY",
      "Subqueries",
    ],
  },
  {
    title: "Programming Fundamentals",
    items: [
      "Object-Oriented Programming",
      "SOLID Principles",
      "Dependency Injection",
      "Collections",
      "Async/Await",
    ],
  },
  {
    title: "API & Security",
    items: [
      "HTTP Methods",
      "HTTP Status Codes",
      "JWT Authentication",
      "Role-Based Authorization",
    ],
  },
  {
    title: "Tools",
    items: [
      "Git",
      "GitHub",
      "Visual Studio",
      "Visual Studio Code",
      "SQL Server Management Studio",
      "Swagger/OpenAPI",
    ],
  },
  {
    title: "Frontend Development",
    statusLabel: "Learning Path",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Vite",
    ],
  },
];

export const educationInfo = {
  institution: "Jordan University of Science and Technology (JUST)",
  degree: "Bachelor of Science in Computer Science",
  location: "Irbid, Jordan",
  year: "2026",
};

export const contactContent = {
  title: "Let's Connect",
  description:
    "I'm currently seeking Junior .NET Backend Developer opportunities. Feel free to reach out to discuss opportunities, projects, or collaboration.",
};

export const dvldProject = {
  name: "DVLD — Driving & Vehicle License Department System",
  shortName: "DVLD System",
  repoUrl: "https://github.com/ayhm325/DVLD-System",
  commitHash: "b3ba343f4f47d886a57869a8ed0a45f0d535329b",
  commitShort: "b3ba343",
  commitUrl:
    "https://github.com/ayhm325/DVLD-System/tree/b3ba343f4f47d886a57869a8ed0a45f0d535329b",
  description:
    "A multi-layered driving license management system built with .NET 8 and ASP.NET Core Web API. The system manages licensing operations through structured application services, SQL Server persistence, and secure role-based access control.",
  backendTechnologies: [
    "C#",
    ".NET 8",
    "ASP.NET Core Web API",
    "Entity Framework Core",
    "SQL Server",
    "LINQ",
    "JWT",
  ],
  frontendTechnologies: ["React", "TypeScript", "Vite"],
  capabilities: [
    "People and Users Management",
    "Drivers Management",
    "Local Driving License Applications",
    "Test Types and Appointments",
    "Test Results Management",
    "First License Issuance",
    "License Renewal",
    "License Replacement",
    "License Detention and Release",
    "International License Management",
    "Authentication and Authorization",
    "Dashboard Statistics",
  ],
  architectureLayers: [
    {
      name: "Domain Layer",
      project: "Domain",
      description: "Core entities and domain concepts.",
    },
    {
      name: "Application Layer",
      project: "Application",
      description:
        "Business logic, application services, DTOs, validators, mappings, and interfaces.",
    },
    {
      name: "Infrastructure Layer",
      project: "Infrastructure",
      description:
        "Entity Framework Core, SQL Server persistence, repositories, migrations, and Unit of Work.",
    },
    {
      name: "API Layer",
      project: "DVLD.Api & DVLD.Contracts",
      description:
        "ASP.NET Core endpoints, shared HTTP contracts, authentication, authorization, and HTTP response handling.",
    },
    {
      name: "ClientApp",
      project: "ClientApp",
      description:
        "React and TypeScript frontend communicating with the API through HTTP and JSON.",
    },
  ] as ArchitectureLayer[],
  architecturePrinciples: [
    "Separation of concerns",
    "Thin API controllers",
    "Dependency Injection",
    "Repository and Unit of Work patterns",
    "Result / Result<T> pattern",
    "Transaction management",
    "DTO-based communication",
  ],
  securityFeatures: [
    "JWT Bearer Authentication",
    "Role-Based Authorization",
    "BCrypt password hashing",
    "Refresh Token Rotation",
    "Session Revocation",
    "Refresh Token Reuse Detection",
    "Rate Limiting",
    "SQL Server application locks for concurrency-sensitive session workflows",
  ],
  testingAndCi: [
    "xUnit unit tests (Application.UnitTests)",
    "API integration tests (API.IntegrationTests)",
    "Infrastructure integration tests (Infrastructure.IntegrationTests)",
    "Azure DevOps Pipelines (azure-pipelines.yml)",
  ],
};
