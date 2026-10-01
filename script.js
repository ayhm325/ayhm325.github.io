(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    // =========================================================
    // HELPERS
    // =========================================================
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    // =========================================================
    // PARTICLE BACKGROUND
    // =========================================================
    const canvas = $("#particle-canvas");
    const ctx = canvas?.getContext("2d");
    let particles = [];
    let mouse = { x: null, y: null };
    let particleFrame = 0;

    function resizeCanvas() {
        if (!canvas || !ctx) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    const codeSymbols = [
        "<>", "{}", "[]", "#", "</>", "C#", ".NET", "API",
        "SQL", "EF", "JWT", "LINQ", "=>", "::", "()", "01"
    ];

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomPosition = false) {
            this.x = Math.random() * window.innerWidth;
            this.y = randomPosition
                ? Math.random() * window.innerHeight
                : window.innerHeight + 30;

            this.size = Math.random() * 7 + 8;
            this.speedX = Math.random() * 0.24 - 0.12;
            this.speedY = -(Math.random() * 0.22 + 0.05);
            this.opacity = Math.random() * 0.20 + 0.07;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = Math.random() * 0.004 - 0.002;
            this.symbol = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
            this.font = Math.random() > 0.35 ? "JetBrains Mono" : "Orbitron";
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            if (this.y < -35 || this.x < -80 || this.x > window.innerWidth + 80) {
                this.reset();
            }

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < 130 && distance > 0) {
                    this.x -= dx / 34;
                    this.y -= dy / 34;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `500 ${this.size}px "${this.font}", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(217, 243, 106, ${this.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(217, 243, 106, 0.16)";
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    function initParticles() {
        if (!canvas || !ctx) return;

        const count = window.innerWidth < 700 ? 14 : window.innerWidth < 1200 ? 24 : 34;
        particles = Array.from({ length: count }, () => new Particle());
    }

    function animateParticles() {
        if (!canvas || !ctx || document.hidden) {
            particleFrame = requestAnimationFrame(animateParticles);
            return;
        }

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const particle of particles) {
            particle.update();
            particle.draw();
        }

        particleFrame = requestAnimationFrame(animateParticles);
    }

    if (canvas && ctx && !prefersReducedMotion) {
        resizeCanvas();
        initParticles();
        animateParticles();

        window.addEventListener("resize", () => {
            resizeCanvas();
            initParticles();
            updateNeuralLines();
        }, { passive: true });

        window.addEventListener("mousemove", (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        }, { passive: true });
    }

    // =========================================================
    // CUSTOM CURSOR
    // =========================================================
    const cursorCore = $(".cursor-core");
    const cursorRing = $(".cursor-ring");

    if (!isTouchDevice && !prefersReducedMotion && cursorCore && cursorRing) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        document.addEventListener("mousemove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            cursorCore.style.left = `${mouseX}px`;
            cursorCore.style.top = `${mouseY}px`;
        }, { passive: true });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        $$(".magnetic, .glass-tilt, .neural-node, .arch-layer, button, a").forEach((element) => {
            element.addEventListener("mouseenter", () => cursorRing.classList.add("hovered"));
            element.addEventListener("mouseleave", () => cursorRing.classList.remove("hovered"));
        });
    }

    // =========================================================
    // MAGNETIC ELEMENTS
    // =========================================================
    if (!isTouchDevice && !prefersReducedMotion) {
        $$(".magnetic").forEach((element) => {
            let currentX = 0;
            let currentY = 0;
            let targetX = 0;
            let targetY = 0;

            element.addEventListener("mousemove", (event) => {
                const rect = element.getBoundingClientRect();
                targetX = (event.clientX - rect.left - rect.width / 2) * 0.18;
                targetY = (event.clientY - rect.top - rect.height / 2) * 0.18;
            });

            element.addEventListener("mouseleave", () => {
                targetX = 0;
                targetY = 0;
            });

            const animate = () => {
                currentX += (targetX - currentX) * 0.16;
                currentY += (targetY - currentY) * 0.16;
                element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                requestAnimationFrame(animate);
            };

            animate();
        });
    }

    // =========================================================
    // 3D TILT
    // =========================================================
    if (!isTouchDevice && !prefersReducedMotion) {
        $$("[data-tilt]").forEach((element) => {
            let rotateX = 0;
            let rotateY = 0;
            let targetX = 0;
            let targetY = 0;

            element.addEventListener("mousemove", (event) => {
                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                targetX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
                targetY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
            });

            element.addEventListener("mouseleave", () => {
                targetX = 0;
                targetY = 0;
            });

            const animate = () => {
                rotateX += (targetX - rotateX) * 0.1;
                rotateY += (targetY - rotateY) * 0.1;

                element.style.transform =
                    `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;

                requestAnimationFrame(animate);
            };

            animate();
        });
    }

    // =========================================================
    // MOBILE NAVIGATION
    // =========================================================
    const navBurger = $("#navBurger");
    const navLinksContainer = $("#navLinks");

    function closeMobileMenu() {
        if (!navBurger || !navLinksContainer) return;
        navBurger.classList.remove("active");
        navLinksContainer.classList.remove("open");
        navBurger.setAttribute("aria-expanded", "false");
        navBurger.setAttribute("aria-label", "Open menu");
    }

    if (navBurger && navLinksContainer) {
        navBurger.addEventListener("click", () => {
            const isOpen = navLinksContainer.classList.toggle("open");
            navBurger.classList.toggle("active", isOpen);
            navBurger.setAttribute("aria-expanded", String(isOpen));
            navBurger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        });

        $$(".nav-links a").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", (event) => {
            if (!navLinksContainer.contains(event.target) && !navBurger.contains(event.target)) {
                closeMobileMenu();
            }
        });
    }

    // =========================================================
    // NEURAL NETWORK
    // =========================================================
    const neuralContainer = $("#neuralContainer");
    const neuralCore = $("#neuralCore");
    const neuralSvg = $("#neuralSvg");
    const neuralInfo = $("#neuralInfo");

    const skills = [
        { name: "C#", top: "15%", left: "20%", desc: "Object-oriented, strongly typed language.", type: "LANGUAGE" },
        { name: "ASP.NET", top: "25%", left: "75%", desc: "Backend APIs and web application framework.", type: "FRAMEWORK" },
        { name: "SQL", top: "70%", left: "15%", desc: "Relational data modeling and querying.", type: "DATABASE" },
        { name: "EF CORE", top: "75%", left: "70%", desc: "ORM, queries and database integration.", type: "DATA ACCESS" },
        { name: "REST", top: "40%", left: "85%", desc: "HTTP-based API design and JSON communication.", type: "ARCHITECTURE" },
        { name: "JWT", top: "10%", left: "50%", desc: "Authentication and authorization with tokens.", type: "SECURITY" },
        { name: "GIT", top: "64%", left: "49.5%", desc: "Version control and collaborative workflows.", type: "TOOLS" },
        { name: "LINQ", top: "50%", left: "10%", desc: "Queries, projections and lambda expressions.", type: "LANGUAGE" }
    ];

    let neuralNodes = [];
    let neuralLines = [];

    function updateNeuralLines() {
        if (!neuralContainer || !neuralCore || !neuralSvg) return;

        const containerRect = neuralContainer.getBoundingClientRect();
        const coreRect = neuralCore.getBoundingClientRect();

        const coreX = coreRect.left - containerRect.left + coreRect.width / 2;
        const coreY = coreRect.top - containerRect.top + coreRect.height / 2;

        neuralNodes.forEach((node, index) => {
            const rect = node.getBoundingClientRect();
            const line = neuralLines[index];

            if (!line) return;

            const nodeX = rect.left - containerRect.left + rect.width / 2;
            const nodeY = rect.top - containerRect.top + rect.height / 2;

            line.setAttribute("x1", coreX);
            line.setAttribute("y1", coreY);
            line.setAttribute("x2", nodeX);
            line.setAttribute("y2", nodeY);
        });
    }

    function resetNeuralInfo() {
        if (!neuralInfo) return;
        $(".info-title", neuralInfo).textContent = "HOVER NODE";
        $(".info-type", neuralInfo).textContent = "TECH STACK";
        $(".info-desc", neuralInfo).textContent = "Select a technology to view its role.";
    }

    if (neuralContainer && neuralCore && neuralSvg && neuralInfo) {
        neuralSvg.innerHTML = "";

        skills.forEach((skill, index) => {
            const node = document.createElement("button");
            node.type = "button";
            node.className = "neural-node";
            node.textContent = skill.name;
            node.style.top = skill.top;
            node.style.left = skill.left;
            node.setAttribute("aria-label", `${skill.name}: ${skill.desc}`);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.classList.add("neural-line");
            line.dataset.nodeIndex = String(index);

            neuralContainer.appendChild(node);
            neuralSvg.appendChild(line);

            neuralNodes.push(node);
            neuralLines.push(line);

            const activate = () => {
                neuralLines.forEach((item, lineIndex) => {
                    item.classList.toggle("active", lineIndex === index);
                });

                neuralNodes.forEach((item, nodeIndex) => {
                    item.classList.toggle("dimmed", nodeIndex !== index);
                });

                $(".info-title", neuralInfo).textContent = skill.name;
                $(".info-type", neuralInfo).textContent = skill.type;
                $(".info-desc", neuralInfo).textContent = skill.desc;
            };

            const deactivate = () => {
                neuralLines.forEach((item) => item.classList.remove("active"));
                neuralNodes.forEach((item) => item.classList.remove("dimmed"));
                resetNeuralInfo();
            };

            node.addEventListener("mouseenter", activate);
            node.addEventListener("focus", activate);
            node.addEventListener("mouseleave", deactivate);
            node.addEventListener("blur", deactivate);
        });

        requestAnimationFrame(updateNeuralLines);
        window.addEventListener("resize", updateNeuralLines, { passive: true });
        window.addEventListener("load", updateNeuralLines, { once: true });
    }

    // =========================================================
    // DVLD ARCHITECTURE TOOLTIP
    // =========================================================
    const archTooltip = $("#archTooltip");

    if (archTooltip) {
        $$(".arch-layer").forEach((layer) => {
            const show = () => {
                archTooltip.textContent = layer.dataset.desc || "";
                archTooltip.classList.add("visible");
                archTooltip.setAttribute("aria-hidden", "false");
            };

            const hide = () => {
                archTooltip.classList.remove("visible");
                archTooltip.setAttribute("aria-hidden", "true");
            };

            layer.addEventListener("mouseenter", show);
            layer.addEventListener("focus", show);
            layer.addEventListener("mouseleave", hide);
            layer.addEventListener("blur", hide);
        });
    }

    // =========================================================
    // ACTIVE NAV + SCROLL PROGRESS
    // =========================================================
    const scrollBeam = $("#scrollProgress");
    const sections = $$("main section");
    const navLinks = $$(".nav-links a");

    function updateScrollUI() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

        if (scrollBeam) {
            scrollBeam.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        }

        let current = "hero";

        sections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - 180) {
                current = section.id;
            }
        });

        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${current}`;
            link.classList.toggle("active", isActive);
        });
    }

    window.addEventListener("scroll", updateScrollUI, { passive: true });
    updateScrollUI();

    // =========================================================
    // SCROLL REVEAL
    // =========================================================
    const revealElements = $$(".reveal");

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealElements.forEach((element) => observer.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("visible"));
    }


    // =========================================================
    // YEAR
    // =========================================================
    const year = $("#year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }
})();


// =========================================================
// V4 CINEMATIC ART-DIRECTION MOTION
// =========================================================
(() => {
  if (prefersReducedMotion || isTouchDevice) return;
  const hero = document.querySelector('.hero-section');
  const visual = document.querySelector('.hero-visual');
  if (!hero || !visual) return;
  let raf = 0;
  let px = 0, py = 0;
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    px = (event.clientX - rect.left) / rect.width - .5;
    py = (event.clientY - rect.top) / rect.height - .5;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      visual.style.setProperty('--mx', `${px * 18}px`);
      visual.style.setProperty('--my', `${py * 14}px`);
      visual.style.transform = `translate3d(${px * 10}px,${py * 8}px,0)`;
    });
  }, {passive:true});
  hero.addEventListener('pointerleave', () => {
    visual.style.transform = '';
    visual.style.removeProperty('--mx');
    visual.style.removeProperty('--my');
  });

  // Cursor spotlight on large interactive surfaces.
  document.querySelectorAll('.glass-tilt,.build-card,.snapshot-card,.contact-cell').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${event.clientX-r.left}px`);
      el.style.setProperty('--spot-y', `${event.clientY-r.top}px`);
    }, {passive:true});
  });
})();
