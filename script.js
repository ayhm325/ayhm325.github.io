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
} else if (!localStorage.theme && window.matchMedia("(prefers-color-scheme: light)").matches) {
    body.classList.add("light");
}

theme.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.theme = body.classList.contains("light") ? "light" : "dark";
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
    body.style.overflow = isOpen ? "hidden" : "";
    menu.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
};

menu.addEventListener("click", toggleMenu);
navLinks.forEach(link => link.addEventListener("click", closeMenu));

/* ===== Year ===== */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ===== Scroll State ===== */
const updateScrollState = () => {
    const y = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (height > 0 ? (y / height) * 100 : 0) + "%";
    header.classList.toggle("scrolled", y > 50);
    
    let currentSection = "";
    sections.forEach(section => {
        if (y >= section.offsetTop - 120) currentSection = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + currentSection);
    });
};

window.addEventListener("scroll", updateScrollState, { passive: true });

/* ===== Scroll Reveal ===== */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

reveals.forEach(element => revealObserver.observe(element));

/* ===== Smooth Scroll ===== */
document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

updateScrollState();

/* =========================================================
   CYBERPUNK EFFECTS: SPOTLIGHT, CURSOR, 3D TILT, MAGNETIC
   ========================================================= */

/* ===== Mouse Spotlight ===== */
const spotlight = document.getElementById("spotlight");
document.addEventListener("mousemove", (e) => {
    if (spotlight) {
        spotlight.style.setProperty('--mouse-x', e.clientX + 'px');
        spotlight.style.setProperty('--mouse-y', e.clientY + 'px');
    }
});

/* ===== Custom Cursor ===== */
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

if (cursorDot && cursorOutline && window.innerWidth > 860) {
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    const interactiveElements = document.querySelectorAll("a, button, .glass-tilt");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => cursorOutline.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursorOutline.classList.remove("hovered"));
    });
}

/* ===== 3D Tilt Effect ===== */
const tiltElements = document.querySelectorAll("[data-tilt]");

tiltElements.forEach(el => {
    el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    el.addEventListener("mouseleave", () => {
        el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
});

/* ===== Magnetic Buttons ===== */
const magnets = document.querySelectorAll(".magnetic");

magnets.forEach(magnet => {
    magnet.addEventListener("mousemove", (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        magnet.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = "translate(0, 0)";
    });
});