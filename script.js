(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const state = {
        raf: 0,
        motionRaf: 0,
        scrollRaf: 0,
        resizeRaf: 0,
        pageVisible: !document.hidden,
        pointerX: null,
        pointerY: null,
        cursorX: 0,
        cursorY: 0,
        pointerActive: false,
        magnetic: [],
        tilt: [],
        startMotionLoop: null
    };

    /* =========================================================
       HELPERS
       ========================================================= */

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const schedule = (key, callback) => {
        if (state[key]) return;
        state[key] = requestAnimationFrame(() => {
            state[key] = 0;
            callback();
        });
    };

    /* =========================================================
       PORTRAIT FALLBACK
       ========================================================= */

    const profilePhoto = $(".profile-photo");
    const profileFallback = $(".profile-fallback");

    if (profilePhoto && profileFallback) {
        const showFallback = () => {
            profilePhoto.hidden = true;
            profileFallback.hidden = false;
        };
        profilePhoto.addEventListener("error", showFallback, { once: true });
        if (profilePhoto.complete && profilePhoto.naturalWidth === 0) showFallback();
    }

    /* =========================================================
       PIRATE COMPASS CURSOR
       ========================================================= */

    const pirateCursor = $(".pirate-cursor");
    const interactiveSelector = [
        "a", "button", ".magnetic", ".neural-node", ".arch-layer", "[data-tilt]"
    ].join(",");

    if (!coarsePointer.matches && !reducedMotion.matches && pirateCursor) {
        document.documentElement.classList.add("custom-cursor-active");

        const setCursorPosition = event => {
            state.pointerX = event.clientX;
            state.pointerY = event.clientY;
            state.pointerActive = true;
            pirateCursor.classList.add("ready");
        };

        window.addEventListener("pointermove", setCursorPosition, { passive: true });

        document.addEventListener("pointerover", event => {
            const target = event.target.closest?.(interactiveSelector);
            if (target) pirateCursor.classList.add("hovered");
        }, { passive: true });

        document.addEventListener("pointerout", event => {
            const related = event.relatedTarget;
            if (!related || !related.closest?.(interactiveSelector)) {
                pirateCursor.classList.remove("hovered");
            }
        }, { passive: true });

        window.addEventListener("blur", () => {
            state.pointerActive = false;
            pirateCursor.classList.remove("ready");
        }, { passive: true });
        window.addEventListener("pointerout", event => {
            if (!event.relatedTarget) {
                state.pointerActive = false;
                pirateCursor.classList.remove("ready");
            }
        }, { passive: true });
    }

    /* =========================================================
       PARTICLE OCEAN
       ========================================================= */

    const canvas = $("#particle-canvas");
    const ctx = canvas?.getContext("2d", { alpha: true });
    let particles = [];
    let canvasRatio = 1;
    let particleCount = 0;

    const symbols = ["C#", ".NET", "API", "SQL", "EF", "JWT", "LINQ", "<>", "{ }", "=>", "01", "⚓", "☠", "✦", "◈"];

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(random = false) {
            this.x = Math.random() * window.innerWidth;
            this.y = random ? Math.random() * window.innerHeight : window.innerHeight + 40;
            this.speedX = Math.random() * 0.18 - 0.09;
            this.speedY = -(Math.random() * 0.18 + 0.035);
            this.size = Math.random() * 5 + 7;
            this.opacity = Math.random() * 0.16 + 0.035;
            this.rotation = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.002 - 0.001;
            this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.spin;

            if (this.y < -40 || this.x < -60 || this.x > window.innerWidth + 60) {
                this.reset();
                return;
            }

            if (state.pointerActive && state.pointerX !== null && !coarsePointer.matches) {
                const dx = state.pointerX - this.x;
                const dy = state.pointerY - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance > 0 && distance < 130) {
                    const force = (130 - distance) / 130;
                    this.x -= (dx / distance) * force * 0.7;
                    this.y -= (dy / distance) * force * 0.7;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `600 ${this.size}px "Share Tech Mono", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(142,244,237,${this.opacity})`;
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    const resizeCanvas = () => {
        if (!canvas || !ctx) return;

        canvasRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(window.innerWidth * canvasRatio);
        canvas.height = Math.floor(window.innerHeight * canvasRatio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(canvasRatio, 0, 0, canvasRatio, 0, 0);
    };

    const getParticleCount = () => {
        if (window.innerWidth < 700) return 10;
        if (window.innerWidth < 1100) return 18;
        return 28;
    };

    const initParticles = (preserve = false) => {
        if (!canvas || !ctx) return;
        const nextCount = getParticleCount();
        if (preserve && particleCount === nextCount) return;
        particleCount = nextCount;
        particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animateParticles = () => {
        if (!canvas || !ctx || reducedMotion.matches || !state.pageVisible) {
            state.raf = 0;
            return;
        }

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }

        state.raf = requestAnimationFrame(animateParticles);
    };

    const startParticleLoop = () => {
        if (!state.raf && canvas && ctx && !reducedMotion.matches && state.pageVisible) {
            state.raf = requestAnimationFrame(animateParticles);
        }
    };

    if (canvas && ctx && !reducedMotion.matches) {
        resizeCanvas();
        initParticles();
        startParticleLoop();
    }

    /* =========================================================
       ONE MOTION LOOP: MAGNETIC + TILT + CURSOR
       ========================================================= */

    if (!coarsePointer.matches && !reducedMotion.matches) {
        const magneticMap = new WeakMap();
        const tiltMap = new WeakMap();

        $$(".magnetic").forEach(element => {
            const item = { element, targetX: 0, targetY: 0, x: 0, y: 0 };
            state.magnetic.push(item);
            magneticMap.set(element, item);
            element.addEventListener("pointermove", event => {
                const rect = element.getBoundingClientRect();
                const maxX = Math.min(12, rect.width * 0.08);
                const maxY = Math.min(10, rect.height * 0.12);
                const item = magneticMap.get(element);
                if (!item) return;
                item.targetX = clamp((event.clientX - rect.left - rect.width / 2) * 0.12, -maxX, maxX);
                item.targetY = clamp((event.clientY - rect.top - rect.height / 2) * 0.12, -maxY, maxY);
            }, { passive: true });
            element.addEventListener("pointerleave", () => {
                const item = magneticMap.get(element);
                if (item) item.targetX = item.targetY = 0;
            }, { passive: true });
        });

        $$('[data-tilt]').forEach(element => {
            const item = { element, targetX: 0, targetY: 0, x: 0, y: 0 };
            state.tilt.push(item);
            tiltMap.set(element, item);
            element.addEventListener("pointermove", event => {
                const rect = element.getBoundingClientRect();
                const item = tiltMap.get(element);
                if (!item) return;
                item.targetX = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
                item.targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
            }, { passive: true });
            element.addEventListener("pointerleave", () => {
                const item = tiltMap.get(element);
                if (item) item.targetX = item.targetY = 0;
            }, { passive: true });
        });

        const motionLoop = () => {
            if (!state.pageVisible) {
                state.motionRaf = 0;
                return;
            }

            if (pirateCursor && state.pointerActive && state.pointerX !== null) {
                state.cursorX += (state.pointerX - state.cursorX) * 0.22;
                state.cursorY += (state.pointerY - state.cursorY) * 0.22;
                pirateCursor.style.setProperty("--cursor-x", `${state.cursorX}px`);
                pirateCursor.style.setProperty("--cursor-y", `${state.cursorY}px`);
            }

            for (const item of state.magnetic) {
                item.x += (item.targetX - item.x) * 0.16;
                item.y += (item.targetY - item.y) * 0.16;
                item.element.style.setProperty("--mag-x", `${item.x}px`);
                item.element.style.setProperty("--mag-y", `${item.y}px`);
            }

            for (const item of state.tilt) {
                item.x += (item.targetX - item.x) * 0.09;
                item.y += (item.targetY - item.y) * 0.09;
                item.element.style.setProperty("--tilt-x", `${item.x}deg`);
                item.element.style.setProperty("--tilt-y", `${item.y}deg`);
            }

            state.motionRaf = requestAnimationFrame(motionLoop);
        };

        const startMotionLoop = () => {
            if (!state.motionRaf && state.pageVisible && !reducedMotion.matches) {
                state.motionRaf = requestAnimationFrame(motionLoop);
            }
        };

        state.startMotionLoop = startMotionLoop;
        startMotionLoop();
    }

    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */

    const burger = $("#navBurger");
    const nav = $("#navLinks");

    const closeNav = () => {
        if (!burger || !nav) return;
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
    };

    if (burger && nav) {
        burger.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("open");
            burger.setAttribute("aria-expanded", String(isOpen));
            burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        });

        $$(".nav-links a").forEach(link => link.addEventListener("click", closeNav));

        document.addEventListener("click", event => {
            if (!nav.classList.contains("open")) return;
            if (!event.target.closest(".pirate-nav")) closeNav();
        });

        window.addEventListener("keydown", event => {
            if (event.key === "Escape") closeNav();
        });
    }

    /* =========================================================
       SKILLS NETWORK
       ========================================================= */

    const neuralContainer = $("#neuralContainer");
    const neuralCore = $("#neuralCore");
    const neuralSvg = $("#neuralSvg");
    const neuralInfo = $("#neuralInfo");

    const skills = [
        { name: "C#", top: "15%", left: "19%", desc: "Core language used across the DVLD application and API.", type: "LANGUAGE" },
        { name: "ASP.NET CORE", top: "25%", left: "75%", desc: "Web API layer for REST endpoints and HTTP concerns.", type: "WEB API" },
        { name: "SQL SERVER", top: "70%", left: "15%", desc: "Relational persistence, queries, relationships and constraints.", type: "DATABASE" },
        { name: "EF CORE", top: "75%", left: "70%", desc: "ORM and persistence layer connecting application workflows to SQL Server.", type: "DATA ACCESS" },
        { name: "REST", top: "42%", left: "84%", desc: "HTTP + JSON API communication exposed by the ASP.NET Core backend.", type: "API DESIGN" },
        { name: "JWT", top: "10%", left: "50%", desc: "Bearer authentication with backend authorization policies.", type: "SECURITY" },
        { name: "DI + UoW", top: "64%", left: "49.5%", desc: "Dependency injection and shared transactional DbContext coordination.", type: "ARCHITECTURE" },
        { name: "TESTING", top: "51%", left: "9%", desc: "Unit and integration testing across application, API and infrastructure behavior.", type: "QUALITY" }
    ];

    const neuralNodes = [];
    const neuralLines = [];
    const infoTitle = $(".info-title", neuralInfo);
    const infoType = $(".info-type", neuralInfo);
    const infoDesc = $(".info-desc", neuralInfo);

    const resetInfo = () => {
        if (infoTitle) infoTitle.textContent = "HOVER NODE";
        if (infoType) infoType.textContent = "TECH STACK";
        if (infoDesc) infoDesc.textContent = "Select a technology to view its role.";
    };

    const activateSkill = index => {
        const skill = skills[index];
        neuralLines.forEach((line, i) => line.classList.toggle("active", i === index));
        neuralNodes.forEach((node, i) => node.classList.toggle("dimmed", i !== index));
        if (infoTitle) infoTitle.textContent = skill.name;
        if (infoType) infoType.textContent = skill.type;
        if (infoDesc) infoDesc.textContent = skill.desc;
    };

    const deactivateSkill = () => {
        neuralLines.forEach(line => line.classList.remove("active"));
        neuralNodes.forEach(node => node.classList.remove("dimmed"));
        resetInfo();
    };

    const updateNeuralLines = () => {
        if (!neuralContainer || !neuralCore || !neuralSvg) return;
        const containerRect = neuralContainer.getBoundingClientRect();
        const coreRect = neuralCore.getBoundingClientRect();
        const centerX = coreRect.left - containerRect.left + coreRect.width / 2;
        const centerY = coreRect.top - containerRect.top + coreRect.height / 2;

        neuralNodes.forEach((node, index) => {
            const line = neuralLines[index];
            if (!line) return;
            const nodeRect = node.getBoundingClientRect();
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", nodeRect.left - containerRect.left + nodeRect.width / 2);
            line.setAttribute("y2", nodeRect.top - containerRect.top + nodeRect.height / 2);
        });
    };

    if (neuralContainer && neuralCore && neuralSvg && neuralInfo) {
        const fragment = document.createDocumentFragment();

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

            fragment.appendChild(node);
            neuralSvg.appendChild(line);
            neuralNodes.push(node);
            neuralLines.push(line);

            node.addEventListener("pointerenter", () => activateSkill(index), { passive: true });
            node.addEventListener("focus", () => activateSkill(index));
            node.addEventListener("pointerleave", deactivateSkill, { passive: true });
            node.addEventListener("blur", deactivateSkill);
        });

        neuralContainer.appendChild(fragment);
        requestAnimationFrame(updateNeuralLines);
        window.addEventListener("load", updateNeuralLines, { once: true });
        if ("ResizeObserver" in window) {
            const neuralResizeObserver = new ResizeObserver(updateNeuralLines);
            neuralResizeObserver.observe(neuralContainer);
        }
    }

    /* =========================================================
       ARCHITECTURE TOOLTIP
       ========================================================= */

    const tooltip = $("#archTooltip");
    if (tooltip) {
        $$(".arch-layer").forEach(layer => {
            const showTooltip = () => {
                tooltip.textContent = layer.dataset.desc || "";
                tooltip.classList.add("visible");
                tooltip.setAttribute("aria-hidden", "false");
            };
            const hideTooltip = () => {
                tooltip.classList.remove("visible");
                tooltip.setAttribute("aria-hidden", "true");
            };

            layer.addEventListener("pointerenter", showTooltip, { passive: true });
            layer.addEventListener("focus", showTooltip);
            layer.addEventListener("pointerleave", hideTooltip, { passive: true });
            layer.addEventListener("blur", hideTooltip);
        });
    }

    /* =========================================================
       SCROLL PROGRESS + ACTIVE NAV
       ========================================================= */

    const progress = $("#scrollProgress");
    const sections = $$('main section[id]');
    const links = $$(".nav-links a");
    let currentSection = "hero";

    const updateScrollProgress = () => {
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const percent = maxScroll ? (window.scrollY / maxScroll) * 100 : 0;
        if (progress) progress.style.width = `${clamp(percent, 0, 100)}%`;
    };

    const setActiveSection = id => {
        if (!id || id === currentSection) return;
        currentSection = id;
        links.forEach(link => {
            const active = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
    };

    window.addEventListener("scroll", () => {
        schedule("scrollRaf", updateScrollProgress);
    }, { passive: true });

    updateScrollProgress();

    if ("IntersectionObserver" in window && sections.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible[0]) setActiveSection(visible[0].target.id);
        }, {
            rootMargin: "-35% 0px -55% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });
        sections.forEach(section => sectionObserver.observe(section));
    }

    /* =========================================================
       REVEAL ANIMATIONS
       ========================================================= */

    const reveals = $$(".reveal");

    if ("IntersectionObserver" in window && !reducedMotion.matches) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
        reveals.forEach(element => revealObserver.observe(element));
    } else {
        reveals.forEach(element => element.classList.add("visible"));
    }

    /* =========================================================
       PAGE VISIBILITY + RESIZE
       ========================================================= */

    document.addEventListener("visibilitychange", () => {
        state.pageVisible = !document.hidden;
        if (state.pageVisible) {
            startParticleLoop();
            state.startMotionLoop?.();
        }
    });

    window.addEventListener("resize", () => {
        schedule("resizeRaf", () => {
            if (canvas && ctx && !reducedMotion.matches) {
                resizeCanvas();
                initParticles(true);
                startParticleLoop();
            }
            updateNeuralLines();
            updateScrollProgress();
        });
    }, { passive: true });

    /* =========================================================
       REDUCED MOTION CHANGES
       ========================================================= */

    reducedMotion.addEventListener?.("change", event => {
        document.documentElement.classList.toggle("reduced-motion", event.matches);
        if (event.matches) {
            if (state.raf) cancelAnimationFrame(state.raf);
            if (state.motionRaf) cancelAnimationFrame(state.motionRaf);
            state.raf = 0;
            state.motionRaf = 0;
        } else {
            resizeCanvas();
            initParticles();
            startParticleLoop();
        }
    });

    /* =========================================================
       CURRENT YEAR
       ========================================================= */

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
})();
