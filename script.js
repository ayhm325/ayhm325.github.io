const body = document.body,
      theme = document.getElementById("theme"),
      menu = document.getElementById("menuBtn"),
      links = document.getElementById("navLinks"),
      progress = document.getElementById("scrollProgress"),
      header = document.getElementById("header"),
      reveals = document.querySelectorAll(".reveal"),
      navA = document.querySelectorAll(".links a[href^='#']");

/* ===== Theme ===== */
if (localStorage.theme === "light") body.classList.add("light");
else if (!localStorage.theme && matchMedia("(prefers-color-scheme:light)").matches) body.classList.add("light");

theme.onclick = () => {
  body.classList.toggle("light");
  localStorage.theme = body.classList.contains("light") ? "light" : "dark";
};

/* ===== Mobile Menu ===== */
menu.onclick = () => {
  menu.classList.toggle("open");
  links.classList.toggle("open");
  body.style.overflow = links.classList.contains("open") ? "hidden" : "";
};

navA.forEach(a => a.onclick = () => {
  menu.classList.remove("open");
  links.classList.remove("open");
  body.style.overflow = "";
});

/* ===== Year ===== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ===== Scroll: Progress + Header + Active Link ===== */
const sections = document.querySelectorAll("section[id]");

onscroll = () => {
  const y = scrollY,
        h = document.documentElement.scrollHeight - innerHeight;

  /* progress bar */
  progress.style.width = (h > 0 ? y / h * 100 : 0) + "%";

  /* header state */
  header.classList.toggle("scrolled", y > 50);

  /* active link */
  let cur = "";
  sections.forEach(s => { if (y >= s.offsetTop - 120) cur = s.id; });
  navA.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
  });
};

/* ===== Scroll Reveal ===== */
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      e.disconnect();
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" })
.observe.bind(new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }));

const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

reveals.forEach(el => revObs.observe(el));

/* ===== Smooth Scroll ===== */
document.querySelectorAll("a[href^='#']").forEach(a => {
  a.onclick = e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
  };
});
