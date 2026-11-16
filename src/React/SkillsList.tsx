import { useState, type ReactNode } from "react";

const CategoryIcons: Record<string, ReactNode> = {
  "Backend & API Engineering": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--sec)] flex-shrink-0"
    >
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  ),
  "Database & Data Access": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--sec)] flex-shrink-0"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  "Security & Architecture": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--sec)] flex-shrink-0"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

const SkillsList = () => {
  const [openItem, setOpenItem] = useState<string | null>(
    "Backend & API Engineering",
  );

  const skills: Record<string, string[]> = {
    "Backend & API Engineering": [
      "RESTful APIs with ASP.NET Core & .NET 8",
      "Thin controllers & DTO-based contracts",
      "Application services & Result / Result<T> pattern",
    ],
    "Database & Data Access": [
      "SQL Server relational schema design & migrations",
      "Entity Framework Core & LINQ queries",
      "Repository & Unit of Work transaction workflows",
    ],
    "Security & Architecture": [
      "JWT Bearer auth & Role-Based Authorization",
      "Refresh token rotation, reuse detection & rate limiting",
      "Layered architecture, SOLID & Dependency Injection",
    ],
  };

  const toggleItem = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  return (
    <div className="text-left pt-3 md:pt-9 w-full lg:w-auto">
      <h2 className="text-[var(--white)] text-3xl md:text-4xl font-semibold md:mb-6">
        Core Focus
      </h2>
      <ul className="space-y-4 mt-4 text-lg">
        {Object.entries(skills).map(([category, items]) => {
          const isOpen = openItem === category;
          return (
            <li key={category} className="w-full">
              <div className="md:w-[420px] w-full bg-[#1414149c] rounded-2xl text-left hover:bg-opacity-80 transition-all border border-[var(--white-icon-tr)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleItem(category)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sec)] rounded-2xl"
                >
                  {CategoryIcons[category]}
                  <div className="flex items-center gap-2 flex-grow justify-between min-w-0">
                    <div className="min-w-0 overflow-hidden">
                      <span className="block truncate text-[var(--white)] text-lg">
                        {category}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className={`w-6 h-6 text-[var(--white)] transform transition-transform flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
                    </svg>
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 px-4 ${
                    isOpen
                      ? "max-h-[500px] pb-4 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-2 text-[var(--white-icon)] text-sm">
                    {items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="pl-1 text-[var(--sec)]" aria-hidden="true">
                          •
                        </span>
                        <span className="pl-3">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SkillsList;
