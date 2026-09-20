const body = document.body;
const theme = document.getElementById("theme");
const menu = document.getElementById("menuBtn");
const links = document.getElementById("navLinks");
const progress = document.getElementById("scrollProgress");
const header = document.getElementById("header");
const reveals = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".links a[href^='#']");
const sections = document.querySelectorAll("section[id]");

/* ===== Theme ===== */

if (localStorage.theme === "light") {
    body.classList.add("light");
} else if (
    !localStorage.theme &&
    window.matchMedia("(prefers-color-scheme: light)").matches
) {
    body.classList.add("light");
}

theme.addEventListener("click", () => {
    body.classList.toggle("light");

    localStorage.theme = body.classList.contains("light")
        ? "light"
        : "dark";
});


/* ===== Mobile Menu ===== */

const closeMenu = () => {
    menu.classList.remove("open");
    links.classList.remove("open");

    body.style.overflow = "";

    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
};

const toggleMenu = () => {
    const isOpen = links.classList.toggle("open");

    menu.classList.toggle("open", isOpen);

    body.style.overflow = isOpen
        ? "hidden"
        : "";

    menu.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menu.setAttribute(
        "aria-label",
        isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
    );
};

menu.addEventListener("click", toggleMenu);

navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});


/* ===== Year ===== */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


/* ===== Scroll: Progress + Header + Active Link ===== */

const updateScrollState = () => {
    const y = window.scrollY;

    const height =
        document.documentElement.scrollHeight -
        window.innerHeight;

    /* Progress bar */

    progress.style.width =
        (height > 0 ? (y / height) * 100 : 0) + "%";


    /* Header state */

    header.classList.toggle(
        "scrolled",
        y > 50
    );


    /* Active navigation link */

    let currentSection = "";

    sections.forEach(section => {
        if (y >= section.offsetTop - 120) {
            currentSection = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") ===
                "#" + currentSection
        );
    });
};

window.addEventListener(
    "scroll",
    updateScrollState,
    { passive: true }
);


/* ===== Scroll Reveal ===== */

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("visible");

            revealObserver.unobserve(
                entry.target
            );
        });
    },
    {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    }
);

reveals.forEach(element => {
    revealObserver.observe(element);
});


/* ===== Smooth Scroll ===== */

document
    .querySelectorAll("a[href^='#']")
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const selector =
                    link.getAttribute("href");

                const target =
                    document.querySelector(selector);

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );
    });


/* ===== Initial Scroll State ===== */

updateScrollState();