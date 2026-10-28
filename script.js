(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const state = {
        pageVisible: !document.hidden,
        pointerX: window.innerWidth / 2,
        pointerY: window.innerHeight / 2,
        cursorX: window.innerWidth / 2,
        cursorY: window.innerHeight / 2,
        pointerActive: false,
        motionRaf: 0,
        ambientRaf: 0,
        coreRaf: 0,
        scrollRaf: 0,
        magneticItems: []
    };

    /* ==========================================================================
       1. MOBILE NAVIGATION & HUD SCROLL SPY
       ========================================================================== */
    const navBurger = $("#navBurger");
    const navLinksContainer = $("#navLinks");
    const navLinks = $$(".nav-link");
    const hudActiveSection = $("#hudActiveSection");
    const scrollProgress = $("#scrollProgress");

    const sectionTitlesMap = {
        hero: "SEC_01 :: SYSTEM_OVERVIEW",
        architecture: "SEC_02 :: LAYERED_ARCHITECTURE",
        projects: "SEC_03 :: DVLD_CASE_STUDY",
        skills: "SEC_04 :: CAPABILITIES_MATRIX",
        philosophy: "SEC_05 :: ENGINEERING_PHILOSOPHY",
        contact: "SEC_06 :: DIRECT_TRANSMISSION"
    };

    const closeMobileNav = ({ restoreFocus = false } = {}) => {
        if (!navBurger || !navLinksContainer) return;
        navLinksContainer.classList.remove("open");
        navBurger.setAttribute("aria-expanded", "false");
        navBurger.setAttribute("aria-label", "Open navigation menu");
        if (restoreFocus) navBurger.focus();
    };

    const openMobileNav = () => {
        if (!navBurger || !navLinksContainer) return;
        navLinksContainer.classList.add("open");
        navBurger.setAttribute("aria-expanded", "true");
        navBurger.setAttribute("aria-label", "Close navigation menu");
        navLinks[0]?.focus();
    };

    if (navBurger && navLinksContainer) {
        navBurger.addEventListener("click", () => {
            if (navLinksContainer.classList.contains("open")) {
                closeMobileNav({ restoreFocus: true });
            } else {
                openMobileNav();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => closeMobileNav());
        });

        document.addEventListener("click", event => {
            if (!navLinksContainer.classList.contains("open")) return;
            if (!event.target.closest(".hud-nav")) {
                closeMobileNav();
            }
        });

        window.addEventListener("keydown", event => {
            if (!navLinksContainer.classList.contains("open")) return;
            if (event.key === "Escape") {
                event.preventDefault();
                closeMobileNav({ restoreFocus: true });
                return;
            }
            if (event.key === "Tab" && navLinks.length > 1) {
                const first = navLinks[0];
                const last = navLinks[navLinks.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 980 && navLinksContainer.classList.contains("open")) {
                closeMobileNav();
            }
        }, { passive: true });
    }

    const updateScrollTelemetry = () => {
        state.scrollRaf = 0;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const pct = maxScroll > 0 ? clamp((window.scrollY / maxScroll) * 100, 0, 100) : 0;
        if (scrollProgress) {
            scrollProgress.style.width = `${pct}%`;
        }
    };

    window.addEventListener("scroll", () => {
        if (!state.scrollRaf) {
            state.scrollRaf = requestAnimationFrame(updateScrollTelemetry);
        }
    }, { passive: true });
    updateScrollTelemetry();

    const sections = $$("main section[id]");
    if ("IntersectionObserver" in window && sections.length) {
        const spyObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (!visible.length) return;

            const activeId = visible[0].target.id;
            navLinks.forEach(link => {
                const isMatch = link.getAttribute("href") === `#${activeId}`;
                link.classList.toggle("active", isMatch);
                if (isMatch) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            if (hudActiveSection && sectionTitlesMap[activeId]) {
                hudActiveSection.textContent = sectionTitlesMap[activeId];
            }
        }, {
            rootMargin: "-30% 0px -55% 0px",
            threshold: [0, 0.25, 0.5, 0.75]
        });

        sections.forEach(sec => spyObserver.observe(sec));
    }

    /* ==========================================================================
       2. PROGRESSIVE REVEAL ANIMATIONS
       ========================================================================== */
    const revealElements = $$(".reveal");
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add("visible"));
    }

    /* ==========================================================================
       3. PRECISION CURSOR, SPOTLIGHT CARDS & MAGNETIC INTERACTIONS
       ========================================================================== */
    const frontierCursor = $("#frontierCursor");
    const cursorCoords = $("#cursorCoords");
    const spotlightCards = $$(".spotlight-card");
    const interactiveSelectors = "a, button, input, .topo-node, .wf-tab, .skill-filter-btn, .core-filter-btn, .term-chip";

    if (!coarsePointer.matches && !reducedMotion.matches) {
        $$(".magnetic").forEach(el => {
            const item = { el, tx: 0, ty: 0, x: 0, y: 0 };
            state.magneticItems.push(item);

            el.addEventListener("pointermove", e => {
                const rect = el.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                item.tx = clamp(dx * 0.14, -10, 10);
                item.ty = clamp(dy * 0.14, -8, 8);
            }, { passive: true });

            el.addEventListener("pointerleave", () => {
                item.tx = 0;
                item.ty = 0;
            }, { passive: true });
        });

        window.addEventListener("pointermove", e => {
            state.pointerX = e.clientX;
            state.pointerY = e.clientY;
            state.pointerActive = true;

            if (frontierCursor) {
                frontierCursor.classList.add("ready");
            }
            if (cursorCoords) {
                const xStr = String(Math.round(e.clientX)).padStart(4, "0");
                const yStr = String(Math.round(e.clientY)).padStart(4, "0");
                cursorCoords.textContent = `${xStr} : ${yStr}`;
            }

            for (const card of spotlightCards) {
                const rect = card.getBoundingClientRect();
                if (
                    e.clientY >= rect.top - 120 &&
                    e.clientY <= rect.bottom + 120 &&
                    e.clientX >= rect.left - 120 &&
                    e.clientX <= rect.right + 120
                ) {
                    card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
                    card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
                }
            }
        }, { passive: true });

        document.addEventListener("pointerover", e => {
            if (!frontierCursor) return;
            if (e.target.closest?.(interactiveSelectors)) {
                frontierCursor.classList.add("hovered");
            }
        }, { passive: true });

        document.addEventListener("pointerout", e => {
            if (!frontierCursor) return;
            const rel = e.relatedTarget;
            if (!rel || !rel.closest?.(interactiveSelectors)) {
                frontierCursor.classList.remove("hovered");
            }
        }, { passive: true });

        const tickPointerMotion = () => {
            if (!state.pageVisible || reducedMotion.matches) {
                state.motionRaf = 0;
                return;
            }

            if (frontierCursor && state.pointerActive) {
                state.cursorX += (state.pointerX - state.cursorX) * 0.25;
                state.cursorY += (state.pointerY - state.cursorY) * 0.25;
                frontierCursor.style.setProperty("--cursor-x", `${state.cursorX}px`);
                frontierCursor.style.setProperty("--cursor-y", `${state.cursorY}px`);
            }

            for (const item of state.magneticItems) {
                item.x += (item.tx - item.x) * 0.18;
                item.y += (item.ty - item.y) * 0.18;
                item.el.style.setProperty("--mag-x", `${item.x.toFixed(2)}px`);
                item.el.style.setProperty("--mag-y", `${item.y.toFixed(2)}px`);
            }

            state.motionRaf = requestAnimationFrame(tickPointerMotion);
        };

        state.motionRaf = requestAnimationFrame(tickPointerMotion);
    }

    /* ==========================================================================
       4. HERO 3D DIMENSIONAL SYSTEM CORE VISUALIZATION (#systemCoreCanvas)
       ========================================================================== */
    const coreCanvas = $("#systemCoreCanvas");
    const coreCtx = coreCanvas?.getContext("2d");
    const coreCoordsReadout = $("#coreCoordsReadout");
    const coreActiveLayerBadge = $("#coreActiveLayerBadge");
    const coreFilterBtns = $$(".core-filter-btn");

    const coreNodes = [
        { id: "wpf", label: "Presentation (WPF)", group: "all", x: -155, y: -58, z: 45, color: "#94a3b8", radius: 6 },
        { id: "dtos", label: "DTOs & Result", group: "api", x: -82, y: -74, z: -40, color: "#38bdf8", radius: 6 },
        { id: "jwt", label: "JWT & RateLimit", group: "security", x: -45, y: 74, z: 65, color: "#a78bfa", radius: 6.5 },
        { id: "api", label: "ASP.NET Core API", group: "api", x: -18, y: -8, z: 18, color: "#00f0ff", radius: 8.5 },
        { id: "app", label: "Application & Domain", group: "app", x: 55, y: 12, z: -15, color: "#8b5cf6", radius: 8.5 },
        { id: "uow", label: "EF Core & UoW", group: "data", x: 118, y: -42, z: 42, color: "#00f0ff", radius: 7.5 },
        { id: "sql", label: "SQL Server DB", group: "data", x: 162, y: 48, z: -32, color: "#10b981", radius: 8 }
    ];

    const coreEdges = [
        { from: 0, to: 1 },
        { from: 1, to: 3 },
        { from: 0, to: 3 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 6 }
    ];

    const corePackets = coreEdges.map((edge, idx) => ({
        edgeIndex: idx,
        progress: (idx * 0.17) % 1,
        speed: 0.0048 + (idx % 3) * 0.0012
    }));

    let coreRotY = -0.35;
    let coreRotX = 0.22;
    let targetRotY = -0.35;
    let targetRotX = 0.22;
    let isDraggingCore = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let activeCoreFilter = "all";

    const resizeCoreCanvas = () => {
        if (!coreCanvas || !coreCtx) return;
        const rect = coreCanvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        coreCanvas.width = Math.floor(rect.width * dpr);
        coreCanvas.height = Math.floor(rect.height * dpr);
        coreCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project3D = (x, y, z, cx, cy, rotX, rotY) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const fov = 420;
        const scale = fov / (fov + z2 + 120);
        return {
            sx: cx + x1 * scale,
            sy: cy + y2 * scale,
            scale,
            z: z2
        };
    };

    const isNodeHighlighted = node => {
        if (activeCoreFilter === "all") return true;
        return node.group === activeCoreFilter;
    };

    const renderSystemCore = (animate = true) => {
        if (!coreCanvas || !coreCtx) return;

        const width = coreCanvas.clientWidth || 600;
        const height = coreCanvas.clientHeight || 295;
        const cx = width / 2;
        const cy = height / 2 - 6;

        coreCtx.clearRect(0, 0, width, height);

        if (animate && !isDraggingCore) {
            targetRotY += 0.0028;
        }

        coreRotY += (targetRotY - coreRotY) * 0.08;
        coreRotX += (targetRotX - coreRotX) * 0.08;

        if (coreCoordsReadout) {
            coreCoordsReadout.textContent = `ROT_X: ${coreRotX.toFixed(2)}rad // ROT_Y: ${(coreRotY % (Math.PI * 2)).toFixed(2)}rad`;
        }

        const ringRadii = [110, 165];
        ringRadii.forEach((r, rIdx) => {
            coreCtx.beginPath();
            const steps = 48;
            for (let i = 0; i <= steps; i++) {
                const theta = (i / steps) * Math.PI * 2;
                const rx = Math.cos(theta) * r;
                const rz = Math.sin(theta) * r;
                const ry = rIdx === 0 ? Math.sin(theta * 2) * 18 : -Math.cos(theta * 2) * 14;
                const pt = project3D(rx, ry, rz, cx, cy, coreRotX, coreRotY);
                if (i === 0) coreCtx.moveTo(pt.sx, pt.sy);
                else coreCtx.lineTo(pt.sx, pt.sy);
            }
            coreCtx.strokeStyle = rIdx === 0 ? "rgba(0, 240, 255, 0.11)" : "rgba(139, 92, 246, 0.11)";
            coreCtx.lineWidth = 1;
            coreCtx.stroke();
        });

        const projectedNodes = coreNodes.map(node => ({
            ...node,
            proj: project3D(node.x, node.y, node.z, cx, cy, coreRotX, coreRotY),
            highlighted: isNodeHighlighted(node)
        }));

        coreEdges.forEach(edge => {
            const nA = projectedNodes[edge.from];
            const nB = projectedNodes[edge.to];
            const activeEdge = nA.highlighted || nB.highlighted;

            coreCtx.beginPath();
            coreCtx.moveTo(nA.proj.sx, nA.proj.sy);
            coreCtx.lineTo(nB.proj.sx, nB.proj.sy);
            coreCtx.strokeStyle = activeEdge
                ? "rgba(0, 240, 255, 0.36)"
                : "rgba(148, 163, 184, 0.09)";
            coreCtx.lineWidth = activeEdge ? 1.5 : 1;
            coreCtx.stroke();
        });

        for (const pkt of corePackets) {
            if (animate) {
                pkt.progress = (pkt.progress + pkt.speed) % 1;
            }
            const edge = coreEdges[pkt.edgeIndex];
            const nA = projectedNodes[edge.from];
            const nB = projectedNodes[edge.to];
            if (!nA.highlighted && !nB.highlighted) continue;

            const px = nA.proj.sx + (nB.proj.sx - nA.proj.sx) * pkt.progress;
            const py = nA.proj.sy + (nB.proj.sy - nA.proj.sy) * pkt.progress;

            coreCtx.beginPath();
            coreCtx.arc(px, py, 2.6, 0, Math.PI * 2);
            coreCtx.fillStyle = "#67f9ff";
            coreCtx.fill();
        }

        const sortedNodes = [...projectedNodes].sort((a, b) => b.proj.z - a.proj.z);

        sortedNodes.forEach(node => {
            const { sx, sy, scale } = node.proj;
            const r = Math.max(4, node.radius * scale);
            const alpha = node.highlighted ? 1 : 0.24;

            if (node.highlighted) {
                const grad = coreCtx.createRadialGradient(sx, sy, 1, sx, sy, r * 3.2);
                grad.addColorStop(0, `${node.color}55`);
                grad.addColorStop(1, "transparent");
                coreCtx.fillStyle = grad;
                coreCtx.beginPath();
                coreCtx.arc(sx, sy, r * 3.2, 0, Math.PI * 2);
                coreCtx.fill();
            }

            coreCtx.save();
            coreCtx.globalAlpha = alpha;
            coreCtx.beginPath();
            coreCtx.arc(sx, sy, r, 0, Math.PI * 2);
            coreCtx.fillStyle = node.color;
            coreCtx.fill();
            coreCtx.lineWidth = 1.5;
            coreCtx.strokeStyle = "#f8fafc";
            coreCtx.stroke();

            coreCtx.font = `600 ${Math.round(10.5 * clamp(scale, 0.85, 1.15))}px "JetBrains Mono", monospace`;
            const textWidth = coreCtx.measureText(node.label).width;
            const boxX = sx - textWidth / 2 - 6;
            const boxY = sy + r + 5;

            coreCtx.fillStyle = "rgba(5, 7, 11, 0.85)";
            coreCtx.fillRect(boxX, boxY, textWidth + 12, 17);
            coreCtx.strokeStyle = node.highlighted ? "rgba(0, 240, 255, 0.38)" : "rgba(148, 163, 184, 0.15)";
            coreCtx.strokeRect(boxX, boxY, textWidth + 12, 17);

            coreCtx.fillStyle = node.highlighted ? "#f8fafc" : "#94a3b8";
            coreCtx.textAlign = "center";
            coreCtx.textBaseline = "middle";
            coreCtx.fillText(node.label, sx, boxY + 8.5);
            coreCtx.restore();
        });

        if (animate && state.pageVisible && !reducedMotion.matches) {
            state.coreRaf = requestAnimationFrame(() => renderSystemCore(true));
        } else {
            state.coreRaf = 0;
        }
    };

    if (coreCanvas && coreCtx) {
        resizeCoreCanvas();

        coreCanvas.addEventListener("pointerdown", e => {
            isDraggingCore = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        });

        window.addEventListener("pointermove", e => {
            if (!isDraggingCore) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            targetRotY += dx * 0.008;
            targetRotX = clamp(targetRotX + dy * 0.006, -0.65, 0.65);
            if (reducedMotion.matches) {
                renderSystemCore(false);
            }
        }, { passive: true });

        window.addEventListener("pointerup", () => {
            isDraggingCore = false;
        }, { passive: true });

        const filterLabels = {
            all: "ACTIVE: FULL STACK TOPOLOGY",
            api: "ACTIVE: HTTP API & DTO BOUNDARY",
            app: "ACTIVE: APPLICATION & DOMAIN LAYERS",
            data: "ACTIVE: EF CORE, UoW & SQL SERVER",
            security: "ACTIVE: JWT, ROLE AUTH & RATE LIMITING"
        };

        coreFilterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                activeCoreFilter = btn.dataset.coreFilter || "all";
                coreFilterBtns.forEach(b => {
                    const active = b === btn;
                    b.classList.toggle("active", active);
                    b.setAttribute("aria-pressed", String(active));
                });
                if (coreActiveLayerBadge) {
                    coreActiveLayerBadge.textContent = filterLabels[activeCoreFilter] || filterLabels.all;
                }
                if (reducedMotion.matches) {
                    renderSystemCore(false);
                }
            });
        });

        renderSystemCore(!reducedMotion.matches);
    }

    /* ==========================================================================
       5. AMBIENT FRONTIER TELEMETRY CANVAS (#ambientCanvas)
       ========================================================================== */
    const ambientCanvas = $("#ambientCanvas");
    const ambientCtx = ambientCanvas?.getContext("2d");
    let ambientParticles = [];

    const initAmbientCanvas = () => {
        if (!ambientCanvas || !ambientCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        ambientCanvas.width = Math.floor(window.innerWidth * dpr);
        ambientCanvas.height = Math.floor(window.innerHeight * dpr);
        ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = window.innerWidth < 768 ? 14 : 26;
        ambientParticles = Array.from({ length: count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.16,
            vy: -(Math.random() * 0.2 + 0.05),
            size: Math.random() * 1.6 + 0.8,
            alpha: Math.random() * 0.35 + 0.1
        }));
    };

    const tickAmbientCanvas = () => {
        if (!ambientCanvas || !ambientCtx || !state.pageVisible || reducedMotion.matches) {
            state.ambientRaf = 0;
            return;
        }

        ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (const p of ambientParticles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) p.y = window.innerHeight + 10;
            if (p.x < -10) p.x = window.innerWidth + 10;
            if (p.x > window.innerWidth + 10) p.x = -10;

            ambientCtx.beginPath();
            ambientCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ambientCtx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
            ambientCtx.fill();
        }

        state.ambientRaf = requestAnimationFrame(tickAmbientCanvas);
    };

    if (ambientCanvas && ambientCtx && !reducedMotion.matches) {
        initAmbientCanvas();
        state.ambientRaf = requestAnimationFrame(tickAmbientCanvas);
    }

    /* ==========================================================================
       6. INTERACTIVE ENGINEERING CLI TERMINAL (#terminalForm)
       ========================================================================== */
    const terminalForm = $("#terminalForm");
    const terminalInput = $("#terminalInput");
    const terminalOutput = $("#terminalOutput");
    const focusCliBtn = $("#focusCliBtn");
    const termChips = $$(".term-chip");
    const cmdHistory = [];
    let historyIdx = -1;

    const appendTerminalLines = lines => {
        if (!terminalOutput) return;
        const fragment = document.createDocumentFragment();
        lines.forEach(({ html, cls = "" }) => {
            const div = document.createElement("div");
            div.className = `term-line ${cls}`.trim();
            div.innerHTML = html;
            fragment.appendChild(div);
        });
        terminalOutput.appendChild(fragment);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const executeCliCommand = rawInput => {
        const cleaned = rawInput.trim();
        if (!cleaned) return;

        cmdHistory.push(cleaned);
        historyIdx = cmdHistory.length;

        const parts = cleaned.toLowerCase().split(/\s+/);
        const cmd = parts[0];
        const arg = parts[1] || "";

        appendTerminalLines([
            { html: `<span class="term-accent">ayhm@core:~$</span> <span class="term-white">${cleaned.replace(/[<>&]/g, "")}</span>` }
        ]);

        switch (cmd) {
            case "help":
                appendTerminalLines([
                    { html: `<span class="term-cyan">Available Engineering Commands:</span>` },
                    { html: `  <span class="term-white">whoami</span>    — Engineer identity, degree (JUST '26) &amp; target role` },
                    { html: `  <span class="term-white">arch</span>      — Inspect 5-layer .NET architecture &amp; patterns` },
                    { html: `  <span class="term-white">dvld</span>      — DVLD system summary, workflows &amp; repository link` },
                    { html: `  <span class="term-white">tests</span>     — View xUnit &amp; Moq automated testing strategy &amp; Azure DevOps CI` },
                    { html: `  <span class="term-white">security</span>  — Inspect JWT Auth, Role-Based Auth &amp; HTTP 429 Login Rate Limiting` },
                    { html: `  <span class="term-white">stack</span>     — List primary backend &amp; database technologies` },
                    { html: `  <span class="term-white">contact</span>   — Display verified email, GitHub &amp; LinkedIn channels` },
                    { html: `  <span class="term-white">cv</span>        — Download verified PDF Curriculum Vitae` },
                    { html: `  <span class="term-white">clear</span>     — Clear terminal buffer` }
                ]);
                break;

            case "whoami":
            case "about":
                appendTerminalLines([
                    { html: `<span class="term-emerald">[IDENTITY]</span> <span class="term-white">Ayhm Mohammed Obeidat</span>` },
                    { html: `  Role:     Junior .NET Backend Developer / Software Engineer` },
                    { html: `  Degree:   B.Sc. in Computer Science (2026) — Jordan University of Science &amp; Technology (JUST)` },
                    { html: `  Location: Irbid / Amman, Jordan` },
                    { html: `  Focus:    C#, .NET, ASP.NET Core Web API, Entity Framework Core, SQL Server, Automated Testing` }
                ]);
                break;

            case "arch":
            case "layers":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[TOPOLOGY]</span> 5-Layer Architecture: <span class="term-white">Domain · Application · Infrastructure · API · Presentation (WPF / MVVM)</span>` },
                    { html: `  Patterns: Dependency Injection, Repository Pattern, Service Layer, Unit of Work, DTOs, Result Pattern, Problem Details` }
                ]);
                break;

            case "dvld":
            case "project":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[FLAGSHIP]</span> <span class="term-white">DVLD — Driving &amp; Vehicle License Department System</span>` },
                    { html: `  Workflows:  License Applications, Test Appointments, License Issuance, Renewal, Replacement, Detention &amp; Release, International Licenses` },
                    { html: `  Repository: <a href="https://github.com/ayhm325/DVLD-WPF" target="_blank" rel="noopener noreferrer" class="term-cyan">https://github.com/ayhm325/DVLD-WPF ↗</a>` }
                ]);
                break;

            case "tests":
            case "test-suite":
            case "qa":
                appendTerminalLines([
                    { html: `<span class="term-emerald">[VERIFICATION]</span> <span class="term-white">Automated Unit &amp; Integration Testing (xUnit &amp; Moq)</span>` },
                    { html: `  • Application Logic: Unit tests for business workflows &amp; service rules` },
                    { html: `  • API Behavior: Integration tests for RESTful endpoints &amp; Problem Details responses` },
                    { html: `  • Infrastructure: Persistence &amp; entity relationship tests with EF Core &amp; SQL Server` },
                    { html: `  • Security: Authentication, role-based authorization &amp; HTTP 429 login rate-limiting scenarios` },
                    { html: `  • CI Pipeline: Git/GitHub + Azure DevOps automated restore &amp; build pipeline` }
                ]);
                break;

            case "security":
            case "auth":
                appendTerminalLines([
                    { html: `<span class="term-violet">[SECURITY BOUNDARY]</span>` },
                    { html: `  • Authentication: JWT authentication for protected API endpoints` },
                    { html: `  • Authorization:  Role-Based authorization across API resources` },
                    { html: `  • Rate Limiting:  Login rate limiting returning HTTP 429 when configured limits are exceeded` },
                    { html: `  • Error Handling: Global exception handling, Result Pattern &amp; Problem Details` }
                ]);
                break;

            case "stack":
            case "skills":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[CORE STACK]</span> C# · SQL · .NET · ASP.NET Core Web API · Entity Framework Core · SQL Server · LINQ · REST APIs · JWT · xUnit · Moq · WPF (MVVM) · Git · Azure DevOps` }
                ]);
                break;

            case "contact":
                appendTerminalLines([
                    { html: `<span class="term-emerald">[CHANNELS]</span>` },
                    { html: `  • Email:    <a href="mailto:ayhmobeidat.cs@gmail.com" class="term-cyan">ayhmobeidat.cs@gmail.com</a>` },
                    { html: `  • GitHub:   <a href="https://github.com/ayhm325" target="_blank" rel="noopener noreferrer" class="term-cyan">https://github.com/ayhm325 ↗</a>` },
                    { html: `  • LinkedIn: <a href="https://www.linkedin.com/in/ayhm-obeidat-75a10a352" target="_blank" rel="noopener noreferrer" class="term-cyan">linkedin.com/in/ayhm-obeidat-75a10a352 ↗</a>` }
                ]);
                break;

            case "cv":
            case "resume":
                appendTerminalLines([
                    { html: `<span class="term-emerald">[CV DOWNLOAD]</span> Download PDF: <a href="assets/Ayhm_Obeidat_CV.pdf" download class="term-cyan">assets/Ayhm_Obeidat_CV.pdf ↓</a>` }
                ]);
                break;

            case "goto": {
                const targetSec = document.getElementById(arg);
                if (targetSec) {
                    targetSec.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
                    appendTerminalLines([{ html: `<span class="term-emerald">[NAV]</span> Navigated to #${arg}` }]);
                } else {
                    appendTerminalLines([{ html: `Usage: goto [architecture|projects|skills|philosophy|contact]` }]);
                }
                break;
            }

            case "clear":
            case "cls":
                if (terminalOutput) terminalOutput.innerHTML = "";
                appendTerminalLines([
                    { html: `// Terminal buffer cleared. Type <span class="term-cyan">help</span> for available commands.`, cls: "term-muted" }
                ]);
                break;

            default:
                appendTerminalLines([
                    { html: `Command not recognized: <span class="term-white">${cmd.replace(/[<>&]/g, "")}</span>. Type <span class="term-cyan">help</span> to list valid commands.`, cls: "term-muted" }
                ]);
                break;
        }
    };

    if (terminalForm && terminalInput) {
        terminalForm.addEventListener("submit", e => {
            e.preventDefault();
            const val = terminalInput.value;
            terminalInput.value = "";
            executeCliCommand(val);
        });

        terminalInput.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                if (cmdHistory.length && historyIdx > 0) {
                    e.preventDefault();
                    historyIdx--;
                    terminalInput.value = cmdHistory[historyIdx];
                }
            } else if (e.key === "ArrowDown") {
                if (historyIdx < cmdHistory.length - 1) {
                    e.preventDefault();
                    historyIdx++;
                    terminalInput.value = cmdHistory[historyIdx];
                } else {
                    historyIdx = cmdHistory.length;
                    terminalInput.value = "";
                }
            }
        });
    }

    termChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const cmd = chip.dataset.cmd;
            if (cmd) executeCliCommand(cmd);
        });
    });

    if (focusCliBtn && terminalInput) {
        focusCliBtn.addEventListener("click", () => {
            terminalInput.focus();
            terminalInput.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
        });
    }

    window.addEventListener("keydown", e => {
        if (
            e.key === "/" &&
            document.activeElement !== terminalInput &&
            !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
        ) {
            e.preventDefault();
            terminalInput?.focus();
        }
    });

    /* ==========================================================================
       7. INSIDE THE SYSTEM — ARCHITECTURE INSPECTOR (#architecture)
       ========================================================================== */
    const archData = {
        api: {
            code: "INSPECTOR // LAYER_02 :: ASP.NET_CORE_WEB_API",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "API Layer — ASP.NET Core Web API",
            summary: "Exposes application functionality through RESTful endpoints while strictly separating HTTP transport, authentication, and error formatting from underlying business logic and data-access responsibilities.",
            decisions: [
                "Separate API controller concerns from business workflows and persistence logic via Dependency Injection.",
                "Protect endpoints with JWT authentication, role-based authorization, and login rate limiting (returning <code>HTTP 429</code> when limits are exceeded).",
                "Centralize API error handling using global exception handling, the Result Pattern, and standardized <code>Problem Details</code> responses."
            ],
            current: "RESTful ASP.NET Core Web API endpoints, JWT authentication, role-based authorization, login rate limiting (HTTP 429), Global Exception Handling, Problem Details, and Swagger/OpenAPI documentation.",
            planned: "Verified with automated unit and integration tests using xUnit and Moq covering API behavior, authentication, and security-related scenarios.",
            filename: "LAYER SPECIFICATION // HTTP & SECURITY BOUNDARY",
            snippet: `Layer Role       : Expose RESTful endpoints & enforce security boundary
Inbound Contract : HTTP Request + DTOs + JWT Bearer Token
Security Guards  : JWT Authentication + Role-Based Authorization
Abuse Protection : Login Rate Limiting -> returns HTTP 429 on repeated attempts
Error Semantics  : Global Exception Handling + Result Pattern -> Problem Details
Verification     : Integration tests covering API behavior, auth & security`,
            tags: ["ASP.NET Core Web API", "REST APIs", "JWT Authentication", "Role-Based Authorization", "Rate Limiting (HTTP 429)", "Problem Details", "Swagger / OpenAPI"]
        },
        application: {
            code: "INSPECTOR // LAYER_03 :: APPLICATION_SERVICE_LAYER",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "Application Layer — Service Layer & Business Workflows",
            summary: "Coordinates core driving-license business workflows (license applications, test appointments, license issuance, renewal, replacement, detention/release, and international licenses) using the Service Layer, DTOs, and Result Pattern while remaining decoupled from HTTP and SQL Server details.",
            decisions: [
                "Model expected business rule failures explicitly through the <code>Result Pattern</code> rather than relying on unhandled exceptions for control flow.",
                "Apply Dependency Injection and SOLID principles so application services depend on Repository and Unit of Work abstractions.",
                "Isolate domain entities from external callers using Data Transfer Objects (<code>DTOs</code>)."
            ],
            current: "Service Layer workflows for license applications, test appointments, license issuance, renewal, replacement, detention and release, and international licenses.",
            planned: "Verified with automated unit tests using xUnit and Moq covering application logic and service-layer business rules.",
            filename: "LAYER SPECIFICATION // APPLICATION WORKFLOW ENGINE",
            snippet: `Layer Role       : Orchestrate business rules & multi-step licensing workflows
Patterns Applied : Service Layer, Dependency Injection, DTOs, Result Pattern
Core Workflows   : Applications, Test Appointments, Issuance, Renewal,
                   Replacement, Detention & Release, International Licenses
Outbound Ports   : Repository & Unit of Work interfaces
Verification     : Unit tests covering application logic with xUnit & Moq`,
            tags: ["C#", ".NET", "Service Layer", "Result Pattern", "DTOs", "SOLID Principles", "Dependency Injection", "xUnit & Moq"]
        },
        infrastructure: {
            code: "INSPECTOR // LAYER_04 :: INFRASTRUCTURE_DATA_ACCESS",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "Infrastructure Layer — EF Core, Repositories & Unit of Work",
            summary: "Implements data-access responsibilities using Entity Framework Core and SQL Server. Applies the Repository and Unit of Work patterns to improve separation of concerns and maintain transactional consistency across persistence operations.",
            decisions: [
                "Encapsulate Entity Framework Core queries and CRUD operations behind Repository interfaces.",
                "Coordinate multi-step persistence changes through the <code>Unit of Work</code> pattern to maintain transactional consistency.",
                "Use LINQ-based queries and entity relationship mappings aligned with the SQL Server relational schema."
            ],
            current: "Entity Framework Core persistence, Repository Pattern, Unit of Work pattern, entity relationships, CRUD operations, and LINQ-based queries.",
            planned: "Verified with automated integration tests covering infrastructure operations and relational persistence.",
            filename: "LAYER SPECIFICATION // INFRASTRUCTURE & PERSISTENCE",
            snippet: `Layer Role       : Persist domain state & enforce transactional consistency
Patterns Applied : Repository Pattern, Unit of Work, Dependency Injection
Data Access      : Entity Framework Core + LINQ-based queries + CRUD operations
Database Target  : Microsoft SQL Server (Entity Relationships & Constraints)
Verification     : Integration tests covering infrastructure operations`,
            tags: ["Entity Framework Core", "Repository Pattern", "Unit of Work", "LINQ", "SQL Server", "Transactional Consistency"]
        },
        database: {
            code: "INSPECTOR // LAYER_05 :: SQL_SERVER_DATABASE",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "Database Layer — Microsoft SQL Server",
            summary: "Provides relational persistence, entity relationships, and data integrity for driving license applications, test appointments, license issuance, renewal, replacement, detention and release, and international licenses.",
            decisions: [
                "Design relational tables with explicit entity relationships in Microsoft SQL Server.",
                "Write SQL queries utilizing <code>JOINs</code>, <code>GROUP BY</code> aggregations, and <code>Subqueries</code> alongside EF Core LINQ queries.",
                "Manage and inspect database schemas and queries using SQL Server Management Studio (SSMS)."
            ],
            current: "Relational database design and entity relationships in Microsoft SQL Server supporting all DVLD licensing, testing, and detention workflows.",
            planned: "Verified through infrastructure and persistence integration tests alongside EF Core CRUD and LINQ operations.",
            filename: "LAYER SPECIFICATION // RELATIONAL DATABASE DESIGN",
            snippet: `Database Engine  : Microsoft SQL Server (Managed via SSMS & EF Core)
Core Capabilities: Database Design, Entity Relationships, CRUD Operations
Query Techniques : SQL Queries, JOINs, GROUP BY, Subqueries, LINQ
Domain Workflows : License Applications, Test Appointments, Issuance,
                   Renewal, Replacement, Detention & Release, International`,
            tags: ["SQL Server", "SQL Queries", "JOINs", "GROUP BY", "Subqueries", "Database Design", "Entity Relationships", "SSMS"]
        },
        presentation: {
            code: "INSPECTOR // LAYER_01 :: WPF_MVVM_PRESENTATION",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "Presentation Layer — WPF Desktop Client (MVVM)",
            summary: "Provides the desktop presentation layer for the driving license management system using Windows Presentation Foundation (WPF) structured with the Model-View-ViewModel (MVVM) pattern.",
            decisions: [
                "Apply the <code>MVVM</code> pattern to separate UI presentation views from state and command handling.",
                "Keep presentation responsibilities isolated from business logic and database persistence layers."
            ],
            current: "WPF desktop presentation layer structured with the MVVM pattern as part of the 5-layer DVLD architecture.",
            planned: "Maintained alongside the multi-layered .NET solution using Git, GitHub, and Azure DevOps build automation.",
            filename: "LAYER SPECIFICATION // DESKTOP PRESENTATION",
            snippet: `Layer Role       : Desktop presentation layer for DVLD workflows
UI Framework     : Windows Presentation Foundation (WPF)
Design Pattern   : Model-View-ViewModel (MVVM)
Boundary Rule    : Separated from business logic and data-access layers`,
            tags: ["WPF", "MVVM", "C#", ".NET", "Separation of Concerns"]
        },
        domain: {
            code: "INSPECTOR // CORE_LAYER :: DOMAIN_ENTITIES",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "Domain Layer — Core Entities & Domain Concepts",
            summary: "Represents the core domain layer of the multi-layered DVLD architecture, modeling essential entities and domain relationships across applications, tests, drivers, and licenses.",
            decisions: [
                "Separate the Domain layer from API transport, presentation UI, and infrastructure persistence concerns.",
                "Represent core licensing entities and relationships cleanly using object-oriented C# principles."
            ],
            current: "Separate Domain layer within the 5-layer DVLD solution architecture.",
            planned: "Exercised through unit tests of application workflows and domain rules using xUnit and Moq.",
            filename: "LAYER SPECIFICATION // DOMAIN MODEL",
            snippet: `Layer Role       : Core business entities and domain concepts
Architecture     : Separate Domain layer in the 5-layer DVLD solution
Principles       : Object-Oriented Programming (OOP) & Separation of Concerns`,
            tags: ["Domain Layer", "C#", "OOP", "Entity Relationships", "Layered Architecture"]
        },
        contracts: {
            code: "INSPECTOR // BOUNDARY :: DTOS_AND_RESULT_PATTERN",
            badge: "CV-VERIFIED SPECIFICATION",
            title: "DTOs, Result Pattern & Problem Details Boundary",
            summary: "Defines clean data-transfer and error-handling contracts across layers—using DTOs for request/response data, the Result Pattern for business outcomes, and Problem Details for standardized HTTP error responses.",
            decisions: [
                "Use Data Transfer Objects (<code>DTOs</code>) to decouple internal domain entities from API request/response payloads.",
                "Combine the <code>Result Pattern</code> with global exception handling and <code>Problem Details</code> for consistent error reporting."
            ],
            current: "DTOs, Result Pattern, Global Exception Handling, and Problem Details responses implemented across the API and Application layers.",
            planned: "Verified through API and application test suites covering expected failure and error-handling scenarios.",
            filename: "LAYER SPECIFICATION // DATA & ERROR CONTRACTS",
            snippet: `Data Contracts   : Data Transfer Objects (DTOs) across service/API boundaries
Outcome Modeling : Result Pattern for explicit success/failure handling
HTTP Error Format: Centralized Global Exception Handling + Problem Details`,
            tags: ["DTOs", "Result Pattern", "Problem Details", "Global Exception Handling", "REST APIs"]
        }
    };

    const topoNodes = $$(".topo-node");
    const inspectorCode = $("#inspectorCode");
    const inspectorBadge = $("#inspectorBadge");
    const inspectorTitle = $("#inspectorTitle");
    const inspectorSummary = $("#inspectorSummary");
    const inspectorDecisions = $("#inspectorDecisions");
    const inspectorCurrent = $("#inspectorCurrent");
    const inspectorPlanned = $("#inspectorPlanned");
    const inspectorCodeFilename = $("#inspectorCodeFilename");
    const inspectorCodeSnippet = $("#inspectorCodeSnippet");
    const inspectorTechTags = $("#inspectorTechTags");
    const archModeNotice = $("#archModeNotice");
    const modeBtns = $$(".mode-btn");

    const selectArchitectureLayer = layerId => {
        const data = archData[layerId];
        if (!data) return;

        topoNodes.forEach(node => {
            const isSelected = node.dataset.layerId === layerId;
            node.classList.toggle("active", isSelected);
            node.setAttribute("aria-selected", String(isSelected));
        });

        if (inspectorCode) inspectorCode.textContent = data.code;
        if (inspectorBadge) inspectorBadge.textContent = data.badge;
        if (inspectorTitle) inspectorTitle.textContent = data.title;
        if (inspectorSummary) inspectorSummary.textContent = data.summary;
        if (inspectorDecisions) {
            inspectorDecisions.innerHTML = data.decisions.map(d => `<li>${d}</li>`).join("");
        }
        if (inspectorCurrent) inspectorCurrent.textContent = data.current;
        if (inspectorPlanned) inspectorPlanned.textContent = data.planned;
        if (inspectorCodeFilename) inspectorCodeFilename.textContent = data.filename;
        if (inspectorCodeSnippet) inspectorCodeSnippet.textContent = data.snippet;
        if (inspectorTechTags) {
            inspectorTechTags.innerHTML = data.tags.map(t => `<span>${t}</span>`).join("");
        }
    };

    topoNodes.forEach((node, index) => {
        node.addEventListener("click", () => {
            selectArchitectureLayer(node.dataset.layerId);
        });

        node.addEventListener("keydown", e => {
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                const next = topoNodes[(index + 1) % topoNodes.length];
                next.focus();
                selectArchitectureLayer(next.dataset.layerId);
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = topoNodes[(index - 1 + topoNodes.length) % topoNodes.length];
                prev.focus();
                selectArchitectureLayer(prev.dataset.layerId);
            }
        });
    });

    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const mode = btn.dataset.archMode;
            modeBtns.forEach(b => {
                const active = b === btn;
                b.classList.toggle("active", active);
                b.setAttribute("aria-pressed", String(active));
            });
            if (archModeNotice) {
                if (mode === "contracts") {
                    archModeNotice.innerHTML = `<strong>Separation &amp; DI View:</strong> Applied Dependency Injection, Repository, Service Layer, and Unit of Work patterns across separate <code>Domain</code>, <code>Application</code>, <code>Infrastructure</code>, <code>API</code>, and <code>Presentation</code> layers.`;
                } else {
                    archModeNotice.innerHTML = `<strong>Runtime Path:</strong> Requests flow across <code>Presentation → API → Application → Infrastructure → SQL Server</code>, with <code>Domain</code> entities and <code>DTOs / Result Pattern</code> maintaining clean layer boundaries.`;
                }
            }
        });
    });

    /* ==========================================================================
       8. DVLD INTERACTIVE BUSINESS WORKFLOW SIMULATOR (#projects)
       ========================================================================== */
    const workflowsData = {
        auth: {
            endpoint: "WORKFLOW 01 // AUTHENTICATION & ENDPOINT PROTECTION",
            constraint: "SECURITY: JWT + ROLE-BASED AUTH + LOGIN RATE LIMITING (HTTP 429)",
            steps: [
                {
                    layer: "01 // API GATEWAY",
                    title: "Login Rate Limiting Guard",
                    desc: "Restricts repeated authentication attempts at the API boundary and returns HTTP 429 when configured rate limits are exceeded."
                },
                {
                    layer: "02 // APPLICATION",
                    title: "Credential Verification & Result Pattern",
                    desc: "Validates user credentials through the Service Layer and models outcomes using the Result Pattern and Problem Details responses."
                },
                {
                    layer: "03 // AUTHORIZATION",
                    title: "JWT & Role-Based Access Control",
                    desc: "Issues JWT tokens and enforces role-based authorization across protected RESTful API endpoints."
                },
                {
                    layer: "04 // VERIFICATION",
                    title: "Authentication & Security Tests",
                    desc: "Verified with automated unit and integration tests covering authentication flows, authorization rules, and security-related scenarios."
                }
            ]
        },
        appointments: {
            endpoint: "WORKFLOW 02 // DRIVING LICENSE APPLICATIONS & TEST APPOINTMENTS",
            constraint: "LAYERS: PRESENTATION → API → APPLICATION → INFRASTRUCTURE → SQL SERVER",
            steps: [
                {
                    layer: "01 // API BOUNDARY",
                    title: "RESTful Endpoint & DTO Request",
                    desc: "Exposes application and test appointment operations through RESTful ASP.NET Core Web API endpoints using structured DTOs."
                },
                {
                    layer: "02 // APPLICATION",
                    title: "Service Layer Business Validation",
                    desc: "Validates driving license application eligibility and test appointment rules in the Service Layer using the Result Pattern."
                },
                {
                    layer: "03 // INFRASTRUCTURE",
                    title: "EF Core & Unit of Work Persistence",
                    desc: "Persists application and test appointment records in SQL Server via Entity Framework Core, Repositories, and the Unit of Work pattern."
                },
                {
                    layer: "04 // VERIFICATION",
                    title: "Application & Persistence Tests",
                    desc: "Covered by xUnit and Moq unit and integration tests verifying application logic, API behavior, and infrastructure operations."
                }
            ]
        },
        issuance: {
            endpoint: "WORKFLOW 03 // LICENSE ISSUANCE, RENEWAL & REPLACEMENT",
            constraint: "CONSISTENCY: REPOSITORY PATTERN + UNIT OF WORK",
            steps: [
                {
                    layer: "01 // APPLICATION",
                    title: "Issuance, Renewal & Replacement Rules",
                    desc: "Service Layer evaluates business requirements for first-time license issuance, expired license renewal, and damaged/lost license replacement."
                },
                {
                    layer: "02 // UNIT OF WORK",
                    title: "Transactional Consistency",
                    desc: "Applies Repository and Unit of Work patterns via Dependency Injection to maintain transactional consistency across multi-step database updates."
                },
                {
                    layer: "03 // DATABASE",
                    title: "SQL Server Entity Relationships",
                    desc: "Updates driver, application, and license records in SQL Server using Entity Framework Core and LINQ-based queries."
                },
                {
                    layer: "04 // ERROR HANDLING",
                    title: "Result Pattern & Problem Details",
                    desc: "Returns structured Problem Details responses if business validation fails, backed by centralized global exception handling."
                }
            ]
        },
        detention: {
            endpoint: "WORKFLOW 04 // LICENSE DETENTION, RELEASE & INTERNATIONAL LICENSES",
            constraint: "DOMAIN WORKFLOWS: DETENTION / RELEASE + INTERNATIONAL ISSUANCE",
            steps: [
                {
                    layer: "01 // BUSINESS LOGIC",
                    title: "Detention & International Eligibility",
                    desc: "Implements core business workflows for detaining licenses, processing license release operations, and issuing international driving licenses."
                },
                {
                    layer: "02 // DATA ACCESS",
                    title: "Relational Queries & CRUD Operations",
                    desc: "Executes CRUD operations and LINQ/SQL queries across related license and detention entities in SQL Server."
                },
                {
                    layer: "03 // API & CLIENT",
                    title: "REST API & WPF MVVM Integration",
                    desc: "Separates presentation concerns in the WPF (MVVM) desktop layer from the ASP.NET Core Web API and backend persistence layers."
                },
                {
                    layer: "04 // CI & QUALITY",
                    title: "Automated Tests & Azure DevOps CI",
                    desc: "Verified by unit and integration test suites and maintained with Git/GitHub version control and an Azure DevOps restore/build pipeline."
                }
            ]
        }
    };

    const wfTabs = $$(".wf-tab");
    const wfTracePanel = $("#wfTracePanel");
    const wfEndpointBadge = $("#wfEndpointBadge");
    const wfConstraintBadge = $("#wfConstraintBadge");
    const wfPipelineSteps = $("#wfPipelineSteps");

    const selectWorkflow = wfKey => {
        const wf = workflowsData[wfKey];
        if (!wf) return;

        wfTabs.forEach(tab => {
            const isSelected = tab.dataset.wf === wfKey;
            tab.classList.toggle("active", isSelected);
            tab.setAttribute("aria-selected", String(isSelected));
            if (isSelected && wfTracePanel) {
                wfTracePanel.setAttribute("aria-labelledby", tab.id);
            }
        });

        if (wfEndpointBadge) wfEndpointBadge.textContent = wf.endpoint;
        if (wfConstraintBadge) wfConstraintBadge.textContent = wf.constraint;
        if (wfPipelineSteps) {
            wfPipelineSteps.innerHTML = wf.steps
                .map(
                    s => `<div class="wf-step">
                        <span class="wf-step-layer">${s.layer}</span>
                        <strong class="wf-step-title">${s.title}</strong>
                        <p class="wf-step-desc">${s.desc}</p>
                    </div>`
                )
                .join("");
        }
    };

    wfTabs.forEach((tab, idx) => {
        tab.addEventListener("click", () => selectWorkflow(tab.dataset.wf));
        tab.addEventListener("keydown", e => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = wfTabs[(idx + 1) % wfTabs.length];
                next.focus();
                selectWorkflow(next.dataset.wf);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = wfTabs[(idx - 1 + wfTabs.length) % wfTabs.length];
                prev.focus();
                selectWorkflow(prev.dataset.wf);
            }
        });
    });

    /* ==========================================================================
       9. CAPABILITIES MATRIX FILTER (#skills)
       ========================================================================== */
    const skillFilterBtns = $$(".skill-filter-btn");
    const capabilityCards = $$(".capability-card");

    skillFilterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.skillFilter || "all";
            skillFilterBtns.forEach(b => {
                const active = b === btn;
                b.classList.toggle("active", active);
                b.setAttribute("aria-pressed", String(active));
            });

            capabilityCards.forEach(card => {
                const match = filter === "all" || card.dataset.skillCategory === filter;
                card.hidden = !match;
            });
        });
    });

    /* ==========================================================================
       10. CONTACT: ONE-CLICK COPY EMAIL & PORTRAIT FALLBACK
       ========================================================================== */
    const copyEmailBtn = $("#copyEmailBtn");
    const copyEmailLabel = $("#copyEmailLabel");
    const copyFeedback = $("#copyFeedback");

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", async () => {
            const email = copyEmailBtn.dataset.email || "ayhmobeidat.cs@gmail.com";
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(email);
                } else {
                    const temp = document.createElement("textarea");
                    temp.value = email;
                    temp.setAttribute("readonly", "");
                    temp.style.position = "absolute";
                    temp.style.left = "-9999px";
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand("copy");
                    temp.remove();
                }
                if (copyEmailLabel) copyEmailLabel.textContent = "COPIED TO CLIPBOARD ✓";
                if (copyFeedback) copyFeedback.textContent = `Copied ${email} to clipboard.`;
            } catch {
                if (copyFeedback) copyFeedback.textContent = `Email: ${email}`;
            }

            setTimeout(() => {
                if (copyEmailLabel) copyEmailLabel.textContent = "COPY EMAIL ADDRESS";
            }, 3200);
        });
    }

    const dossierPhoto = $(".dossier-photo");
    const dossierFallback = $(".dossier-fallback");
    if (dossierPhoto && dossierFallback) {
        dossierPhoto.addEventListener("error", () => {
            if (dossierPhoto.src.endsWith("ayhmImage.JPG")) {
                dossierPhoto.hidden = true;
                dossierFallback.hidden = false;
            }
        });
    }

    /* ==========================================================================
       11. VISIBILITY, RESIZE & REDUCED MOTION LIFECYCLE
       ========================================================================== */
    window.addEventListener("resize", () => {
        resizeCoreCanvas();
        if (reducedMotion.matches) {
            renderSystemCore(false);
        }
        if (ambientCanvas && ambientCtx && !reducedMotion.matches) {
            initAmbientCanvas();
        }
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
        state.pageVisible = !document.hidden;
        if (state.pageVisible && !reducedMotion.matches) {
            if (!state.coreRaf) renderSystemCore(true);
            if (!state.ambientRaf) state.ambientRaf = requestAnimationFrame(tickAmbientCanvas);
        }
    });

    reducedMotion.addEventListener?.("change", e => {
        if (e.matches) {
            if (state.coreRaf) cancelAnimationFrame(state.coreRaf);
            if (state.ambientRaf) cancelAnimationFrame(state.ambientRaf);
            if (state.motionRaf) cancelAnimationFrame(state.motionRaf);
            state.coreRaf = 0;
            state.ambientRaf = 0;
            state.motionRaf = 0;
            renderSystemCore(false);
        } else {
            renderSystemCore(true);
            initAmbientCanvas();
            state.ambientRaf = requestAnimationFrame(tickAmbientCanvas);
        }
    });

    const yearEl = $("#year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
})();
