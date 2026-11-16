import type { ReactNode } from "react";
import Folder, { type FolderEntry } from "./Folder";
import MaskedHeading from "./MaskedHeading";
import ElectricBorder from "./ElectricBorder";

interface FocusCategory {
  title: string;
  items: string[];
  icon: ReactNode;
}

const categories: FocusCategory[] = [
  {
    title: "Backend & API Engineering",
    items: [
      "RESTful APIs with ASP.NET Core & .NET 8",
      "Thin controllers & DTO-based contracts",
      "Application services & Result / Result<T> pattern",
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-[#7df9ff] flex-shrink-0"
      >
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    ),
  },
  {
    title: "Database & Data Access",
    items: [
      "SQL Server relational schema design & migrations",
      "Entity Framework Core & LINQ queries",
      "Repository & Unit of Work transaction workflows",
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-[#a476ff] flex-shrink-0"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  },
  {
    title: "Security & Architecture",
    items: [
      "JWT Bearer auth & Role-Based Authorization",
      "Refresh token rotation, reuse detection & rate limiting",
      "Layered architecture, SOLID & Dependency Injection",
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-[#7df9ff] flex-shrink-0"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const folderItems: FolderEntry[] = categories.map((cat) => ({
  title: cat.title,
  content: (
    <div className="box-border flex h-full flex-col justify-between p-3 text-left">
      <div className="flex items-center gap-1.5 border-b border-[#a476ff30] pb-1.5">
        {cat.icon}
        <span className="text-[10px] font-semibold leading-tight text-white">
          {cat.title}
        </span>
      </div>
      <ul className="my-auto space-y-1.5 py-1">
        {cat.items.map((point) => (
          <li
            key={point}
            className="flex items-start gap-1.5 text-[8.5px] leading-snug text-[#d4d4dc]"
          >
            <span className="text-[#a476ff]" aria-hidden="true">
              •
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-[#ffffff12] pt-1 text-[7.5px] text-[#7df9ff]/80">
        <span>.NET 8</span>
        <span>Click / Drag</span>
      </div>
    </div>
  ),
}));

const SkillsList = () => {
  return (
    <div className="text-left pt-3 md:pt-9 w-full lg:w-auto flex flex-col items-center lg:items-start">
      <div className="mb-4 w-full md:w-[420px]">
        <MaskedHeading
          tag="h2"
          text="Core Focus"
          fillScale={1.25}
          parallax={26}
          reveal="scale"
          trigger="view"
          spotlight={false}
          spotlightRadius={180}
          outline={false}
          duration={1.1}
          stagger={0.09}
          drift={18}
          hoverZoom={0}
          align="left"
          brightness={1}
          saturation={1}
          grayscale={false}
          outlineWidth={1}
          weight={700}
          tracking={-0.03}
          lineHeight={1.06}
          textScale={0.085}
          tint="#f43f5e"
        />
      </div>

      <ElectricBorder
        color="#7df9ff"
        speed={1}
        chaos={0.5}
        spread={0.6}
        strands={3}
        thickness={1.5}
        borderRadius={16}
        className="md:w-[420px] w-full"
      >
        <div className="relative flex flex-col items-center justify-center py-6 px-4 w-full min-h-[300px] rounded-2xl bg-[#0b0b10]/70 border border-[#a476ff30]">
          <Folder
            label="Core Focus"
            items={folderItems}
            mode="flap"
            variant="neon"
            layout="spread"
            color="#0d0d12"
            paperColor="#101018"
            neonColor="#a476ff"
            tabPosition="right"
            openOn="click"
            size={1.22}
            tilt={0.5}
            speed={1}
            bounce={0.4}
            peek
            intro
            draggable
            zoomOnClick
            theme="dark"
          />
          <p className="mt-5 text-xs text-[var(--white-icon)] text-center">
            Click folder to spread cards · Drag or click any card to inspect
          </p>
        </div>
      </ElectricBorder>
    </div>
  );
};

export default SkillsList;
