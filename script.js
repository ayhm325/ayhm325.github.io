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
        { id: "wpf", label: "WPF MVVM", group: "all", x: -155, y: -58, z: 45, color: "#94a3b8", radius: 6 },
        { id: "contracts", label: "DVLD.Contracts", group: "api", x: -82, y: -74, z: -40, color: "#38bdf8", radius: 6 },
        { id: "jwt", label: "JWT + RateLimit", group: "security", x: -45, y: 74, z: 65, color: "#a78bfa", radius: 6.5 },
        { id: "api", label: "ASP.NET Core API", group: "api", x: -18, y: -8, z: 18, color: "#00f0ff", radius: 8.5 },
        { id: "app", label: "Application Core", group: "app", x: 55, y: 12, z: -15, color: "#8b5cf6", radius: 8.5 },
        { id: "uow", label: "EF Core 8 / UoW", group: "data", x: 118, y: -42, z: 42, color: "#00f0ff", radius: 7.5 },
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
        // Rotate around Y axis
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X axis
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

        // Draw 3D orbital wireframe rings
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

        // Project all nodes
        const projectedNodes = coreNodes.map(node => ({
            ...node,
            proj: project3D(node.x, node.y, node.z, cx, cy, coreRotX, coreRotY),
            highlighted: isNodeHighlighted(node)
        }));

        // Draw directed edges
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

        // Draw live telemetry packets traveling across edges
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

        // Sort nodes back-to-front by Z depth
        const sortedNodes = [...projectedNodes].sort((a, b) => b.proj.z - a.proj.z);

        sortedNodes.forEach(node => {
            const { sx, sy, scale } = node.proj;
            const r = Math.max(4, node.radius * scale);
            const alpha = node.highlighted ? 1 : 0.24;

            // Outer glow
            if (node.highlighted) {
                const grad = coreCtx.createRadialGradient(sx, sy, 1, sx, sy, r * 3.2);
                grad.addColorStop(0, `${node.color}55`);
                grad.addColorStop(1, "transparent");
                coreCtx.fillStyle = grad;
                coreCtx.beginPath();
                coreCtx.arc(sx, sy, r * 3.2, 0, Math.PI * 2);
                coreCtx.fill();
            }

            // Core node circle
            coreCtx.save();
            coreCtx.globalAlpha = alpha;
            coreCtx.beginPath();
            coreCtx.arc(sx, sy, r, 0, Math.PI * 2);
            coreCtx.fillStyle = node.color;
            coreCtx.fill();
            coreCtx.lineWidth = 1.5;
            coreCtx.strokeStyle = "#f8fafc";
            coreCtx.stroke();

            // Node label pill
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
            api: "ACTIVE: HTTP API & CONTRACTS BOUNDARY",
            app: "ACTIVE: APPLICATION USE-CASE ENGINE",
            data: "ACTIVE: EF CORE 8, UoW & SQL SERVER",
            security: "ACTIVE: JWT BEARER & IP RATE LIMITER"
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
                    { html: `  <span class="term-white">arch</span>      — Inspect 5-layer .NET runtime &amp; boundary architecture` },
                    { html: `  <span class="term-white">dvld</span>      — DVLD system summary, workflows &amp; repository link` },
                    { html: `  <span class="term-white">tests</span>     — View 1,487 historical automated tests &amp; Azure DevOps CI` },
                    { html: `  <span class="term-white">security</span>  — Inspect JWT Bearer, Policy Auth &amp; 5 req/min Rate Limiter` },
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
                    { html: `  Focus:    C#, .NET 8, ASP.NET Core Web API, EF Core 8, SQL Server, Automated Testing` }
                ]);
                break;

            case "arch":
            case "layers":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[TOPOLOGY]</span> Runtime Chain: <span class="term-white">Presentation (WPF) → ASP.NET Core API → Application → Infrastructure → SQL Server</span>` },
                    { html: `  Boundaries: <span class="term-violet">Domain</span> (Entities/Enums) &amp; <span class="term-violet">DVLD.Contracts</span> (Shared HTTP DTOs)` },
                    { html: `  Patterns:   Thin Controllers, Result&lt;T&gt;, ProblemDetails, Repository + Shared Scoped UoW (Serializable)` }
                ]);
                break;

            case "dvld":
            case "project":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[FLAGSHIP]</span> <span class="term-white">DVLD — Driving &amp; Vehicle License Department System</span>` },
                    { html: `  Workflows:  License Applications, Vision/Written/Street Tests, Issuance, Renewal, Replacement, Detention/Release, International Licenses` },
                    { html: `  Repository: <a href="https://github.com/ayhm325/DVLD-WPF" target="_blank" rel="noopener noreferrer" class="term-cyan">https://github.com/ayhm325/DVLD-WPF ↗</a>` }
                ]);
                break;

            case "tests":
            case "test-suite":
            case "qa":
                appendTerminalLines([
                    { html: `<span class="term-emerald">[VERIFICATION]</span> <span class="term-white">1,487 Historically Reported Passing Automated Tests (xUnit + Moq)</span>` },
                    { html: `  • 631 Unit Tests (Application services, business rules &amp; validations)` },
                    { html: `  • 492 Infrastructure Tests (EF Core 8 repositories, SQL constraints &amp; UoW)` },
                    { html: `  • 364 API Integration Tests (Controllers, ProblemDetails, JWT &amp; Rate Limiting)` },
                    { html: `  • CI Pipeline: Git/GitHub + Azure DevOps automated restore &amp; build pipeline` }
                ]);
                break;

            case "security":
            case "auth":
                appendTerminalLines([
                    { html: `<span class="term-violet">[SECURITY BOUNDARY]</span>` },
                    { html: `  • Authentication: JWT Bearer signed token validation` },
                    { html: `  • Authorization:  Role-Based &amp; Policy-Based endpoint protection` },
                    { html: `  • Rate Limiting:  5 requests / IP / minute on login → returns HTTP 429 ProblemDetails` }
                ]);
                break;

            case "stack":
            case "skills":
                appendTerminalLines([
                    { html: `<span class="term-cyan">[CORE STACK]</span> C# · .NET 8 · ASP.NET Core Web API · Entity Framework Core 8 · SQL Server · LINQ · REST APIs · JWT · xUnit · Moq · WPF (MVVM) · Git · Azure DevOps` }
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
                    { html: `<span class="term-emerald">[CV DOWNLOAD]</span> Opening <a href="assets/Ayhm_Obeidat_CV.pdf" download class="term-cyan">assets/Ayhm_Obeidat_CV.pdf ↓</a>` }
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
            code: "INSPECTOR // LAYER_02 :: ASP.NET_CORE_API",
            badge: "VERIFIED IN REPO",
            title: "API Layer — ASP.NET Core Web API",
            summary: "Acts strictly as the HTTP transport and security gateway. Exposes RESTful endpoints, enforces JWT Bearer authentication, evaluates role/policy authorization, applies IP login rate limiting, and translates Application Result outcomes into standardized RFC 7807 ProblemDetails responses.",
            decisions: [
                "Keep controllers thin: zero direct <code>DbContext</code> calls or embedded SQL inside controller actions.",
                "Centralize failure formatting with Global Exception Handling and <code>ProblemDetails</code> instead of ad-hoc error strings.",
                "Enforce IP-based login rate limiting (5 requests / IP / minute) returning <code>HTTP 429 Too Many Requests</code>."
            ],
            current: "REST controllers, JWT Bearer authentication, role/policy authorization, IP rate-limited login endpoint, Swagger/OpenAPI docs, and 364 historical API integration tests.",
            planned: "Refresh token rotation workflow, distributed rate-limit backing store for multi-instance horizontal scaling, and OpenTelemetry request tracing.",
            filename: "ControllerBoundaryPattern.cs",
            snippet: `[Authorize(Policy = "CanManageLicenses")]
[HttpPost("issue")]
public async Task<IActionResult> IssueLicense(
    [FromBody] IssueLicenseRequest request,
    CancellationToken ct)
{
    Result<LicenseResponse> result =
        await _licenseService.IssueFirstTimeLicenseAsync(request, ct);

    return result.IsSuccess
        ? CreatedAtAction(nameof(GetById), new { id = result.Value.LicenseId }, result.Value)
        : result.ToProblemDetails(HttpContext);
}`,
            tags: ["ASP.NET Core Web API", "JWT Bearer", "Role & Policy Auth", "Rate Limiting (HTTP 429)", "RFC 7807 ProblemDetails", "Swagger / OpenAPI"]
        },
        application: {
            code: "INSPECTOR // LAYER_03 :: APPLICATION_CORE",
            badge: "VERIFIED IN REPO",
            title: "Application Layer — Use Cases & Business Services",
            summary: "Owns business workflows, state-transition validation, DTO mapping, Result<T> error modeling, and persistence abstractions (Repository and Unit of Work interfaces). Remains completely agnostic of HTTP context or SQL Server specifics.",
            decisions: [
                "Use the <code>Result&lt;T&gt;</code> pattern for expected business rule failures (e.g., active license detention or missing test prerequisites) rather than throwing exceptions for control flow.",
                "Coordinate multi-step licensing operations through explicit <code>IUnitOfWork</code> transaction abstractions.",
                "Design service constructors around interfaces to enable fast, deterministic unit testing with <code>xUnit</code> and <code>Moq</code>."
            ],
            current: "Service layer orchestrating driving license applications, sequential test appointments, license issuance, renewals, replacements, detention/release, and 631 historical unit tests.",
            planned: "Dedicated command/query pipeline behaviors for cross-cutting audit logging and declarative request validation.",
            filename: "LicenseIssuanceWorkflow.cs",
            snippet: `public async Task<Result<LicenseDto>> IssueFirstTimeLicenseAsync(
    IssueLicenseCommand cmd, CancellationToken ct)
{
    if (!await _testRepo.HasPassedAllTestsAsync(cmd.ApplicationId, ct))
        return Result.Failure<LicenseDto>(LicenseErrors.PrerequisitesNotMet);

    await using var tx = await _uow.BeginSerializableTransactionAsync(ct);
    var driver = await _driverRepo.GetOrCreateForPersonAsync(cmd.PersonId, ct);
    var license = License.CreateFirstTime(driver.Id, cmd.LicenseClassId);

    await _licenseRepo.AddAsync(license, ct);
    await _applicationRepo.MarkCompletedAsync(cmd.ApplicationId, ct);
    await _uow.CommitAsync(ct);

    return Result.Success(license.ToDto());
}`,
            tags: ["C#", ".NET 8", "Service Layer", "Result Pattern", "DTO Mapping", "Dependency Injection", "xUnit + Moq (631 Unit Tests)"]
        },
        infrastructure: {
            code: "INSPECTOR // LAYER_04 :: INFRASTRUCTURE_PERSISTENCE",
            badge: "VERIFIED IN REPO",
            title: "Infrastructure Layer — EF Core 8, Repositories & Unit of Work",
            summary: "Implements Application persistence interfaces using Entity Framework Core 8 and Microsoft SQL Server. Coordinates shared scoped DbContext instances and explicit Serializable transactions to guarantee atomic writes across multiple repositories.",
            decisions: [
                "Share a single scoped <code>DbContext</code> across repositories within a request via the Unit of Work pattern so multi-entity updates commit or roll back atomically.",
                "Use <code>Serializable</code> transaction isolation on concurrency-sensitive workflows to prevent duplicate active applications or double license issuance.",
                "Write expressive, parameterized LINQ queries and entity configurations mapped to SQL Server constraints."
            ],
            current: "EF Core 8 DbContext, concrete repositories, shared scoped Unit of Work with explicit transaction control, and 492 historical infrastructure integration tests.",
            planned: "Read-optimized projection queries for high-volume reporting dashboards and automated database migration health checks.",
            filename: "UnitOfWorkTransactionScope.cs",
            snippet: `public sealed class UnitOfWork : IUnitOfWork
{
    private readonly DvldDbContext _dbContext;

    public UnitOfWork(DvldDbContext dbContext) => _dbContext = dbContext;

    public async Task<IDbContextTransaction> BeginSerializableTransactionAsync(
        CancellationToken ct = default)
    {
        return await _dbContext.Database
            .BeginTransactionAsync(IsolationLevel.Serializable, ct);
    }

    public Task<int> CommitAsync(CancellationToken ct = default) =>
        _dbContext.SaveChangesAsync(ct);
}`,
            tags: ["Entity Framework Core 8", "Unit of Work", "Repository Pattern", "Serializable Transactions", "LINQ", "492 Infrastructure Tests"]
        },
        database: {
            code: "INSPECTOR // LAYER_05 :: SQL_SERVER_PERSISTENCE",
            badge: "VERIFIED IN REPO",
            title: "Database Layer — Microsoft SQL Server",
            summary: "Serves as the relational system of record enforcing referential integrity, foreign-key relationships, unique constraints, and transactional durability across citizens, drivers, applications, test appointments, licenses, and detentions.",
            decisions: [
                "Enforce relational integrity at the database schema level with foreign keys, unique indexes, and check constraints rather than relying solely on application checks.",
                "Normalize core entities (People, Users, Drivers, Applications, TestAppointments, Tests, Licenses, DetainedLicenses, InternationalLicenses).",
                "Leverage JOINs, GROUP BY aggregations, and subqueries for accurate eligibility and historical status lookups."
            ],
            current: "Normalized SQL Server relational schema managed with SSMS and EF Core mappings, verified against 492 infrastructure persistence tests.",
            planned: "Dedicated composite covering indexes for audit history filtering and automated SQL backup verification scripts.",
            filename: "RelationalIntegrityCheck.sql",
            snippet: `-- Verify active application uniqueness per Person & LicenseClass
SELECT a.ApplicationID, a.ApplicantPersonID, l.LicenseClassID, a.ApplicationStatus
FROM Applications AS a
INNER JOIN LocalDrivingLicenseApplications AS l
    ON a.ApplicationID = l.ApplicationID
WHERE a.ApplicantPersonID = @PersonId
  AND l.LicenseClassID = @LicenseClassId
  AND a.ApplicationStatus IN (1, 3); -- 1: New, 3: Completed`,
            tags: ["Microsoft SQL Server", "Relational Schema Design", "Foreign Keys & Constraints", "JOINs & Subqueries", "GROUP BY", "SSMS"]
        },
        presentation: {
            code: "INSPECTOR // LAYER_01 :: WPF_MVVM_CLIENT",
            badge: "VERIFIED IN REPO",
            title: "Presentation Layer — WPF Desktop Client (MVVM)",
            summary: "Provides the desktop operator interface for licensing department staff using Windows Presentation Foundation (WPF) structured around the Model-View-ViewModel (MVVM) pattern, communicating with the backend through shared HTTP contracts.",
            decisions: [
                "Separate UI views from presentation state and command logic using ViewModels and data binding.",
                "Communicate with the backend via strongly-typed HTTP request/response models defined in <code>DVLD.Contracts</code>.",
                "Surface API validation and <code>ProblemDetails</code> errors cleanly to operators."
            ],
            current: "WPF desktop application implementing MVVM presentation flows for managing people, users, applications, test appointments, and licenses.",
            planned: "Centralized client-side token refresh handler and offline connectivity status indicator.",
            filename: "LicenseViewModelPattern.cs",
            snippet: `public async Task ExecuteIssueLicenseCommandAsync()
{
    IsBusy = true;
    var response = await _apiClient.PostAsync<IssueLicenseRequest, LicenseResponse>(
        "api/licenses/issue",
        new IssueLicenseRequest(ApplicationId, Notes));

    StatusMessage = response.IsSuccess
        ? $"License #{response.Data.LicenseId} issued."
        : response.ErrorProblem.Detail;
    IsBusy = false;
}`,
            tags: ["WPF (.NET Desktop)", "MVVM Pattern", "Data Binding", "Typed HTTP Client", "C#"]
        },
        domain: {
            code: "INSPECTOR // CORE_BOUNDARY :: DOMAIN_MODEL",
            badge: "VERIFIED IN REPO",
            title: "Domain Layer — Core Entities, Enums & Business Rules",
            summary: "Represents the heart of the driving license domain—defining core entities, lifecycle status enumerations, license class rules, and domain invariants with zero dependency on external frameworks, databases, or UI technology.",
            decisions: [
                "Keep the Domain project dependency-free so core concepts cannot be polluted by EF Core attributes or HTTP transport concerns.",
                "Model application statuses (New, Cancelled, Completed) and test types (Vision, Written, Street) as explicit strongly-typed enums and domain structures."
            ],
            current: "Core domain entities and enumerations shared by Application and Infrastructure layers.",
            planned: "Richer domain events for decoupled audit trail generation on license status changes.",
            filename: "DomainEntitiesAndEnums.cs",
            snippet: `namespace DVLD.Domain.Enums;

public enum ApplicationStatus : byte
{
    New = 1,
    Cancelled = 2,
    Completed = 3
}

public enum TestType : byte
{
    VisionTest = 1,
    WrittenTheoryTest = 2,
    PracticalStreetTest = 3
}`,
            tags: ["Domain Modeling", "Entities & Value Rules", "Strongly-Typed Enums", "Zero External Dependencies", "C#"]
        },
        contracts: {
            code: "INSPECTOR // SHARED_BOUNDARY :: DVLD_CONTRACTS",
            badge: "VERIFIED IN REPO",
            title: "DVLD.Contracts — Shared HTTP Request/Response Boundary",
            summary: "Defines the explicit wire-level DTOs and request/response schemas shared between the WPF Presentation client and the ASP.NET Core Web API—preventing internal Domain or EF Core entities from leaking across the network boundary.",
            decisions: [
                "Isolate wire contracts into a dedicated <code>DVLD.Contracts</code> assembly so client and server remain compile-time aligned without sharing internal implementation assemblies.",
                "Ensure internal database schema changes never accidentally break public JSON API payloads."
            ],
            current: "Shared request and response DTO records/classes consumed by both the ASP.NET Core Web API and WPF client.",
            planned: "Versioned contract namespaces (v1 / v2) for backward-compatible API evolution.",
            filename: "IssueLicenseContracts.cs",
            snippet: `namespace DVLD.Contracts.Licenses;

public sealed record IssueLicenseRequest(
    int LocalDrivingLicenseApplicationId,
    string? Notes
);

public sealed record LicenseResponse(
    int LicenseId,
    int DriverId,
    int LicenseClassId,
    DateTime IssueDate,
    DateTime ExpirationDate,
    bool IsActive
);`,
            tags: ["DVLD.Contracts", "DTOs", "JSON Wire Contracts", "API Boundary Isolation", "C#"]
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
                    archModeNotice.innerHTML = `<strong>Dependency &amp; DI View:</strong> <code>API</code> and <code>Infrastructure</code> depend inward on <code>Application</code> abstractions; <code>Domain</code> has zero outward dependencies; <code>DVLD.Contracts</code> bridges client &amp; API.`;
                } else {
                    archModeNotice.innerHTML = `<strong>Runtime Path:</strong> Requests traverse <code>Presentation → API → Application → Infrastructure → SQL Server</code>, while <code>Domain</code> and <code>DVLD.Contracts</code> act as shared architectural boundaries.`;
                }
            }
        });
    });

    /* ==========================================================================
       8. DVLD INTERACTIVE BUSINESS WORKFLOW SIMULATOR (#projects)
       ========================================================================== */
    const workflowsData = {
        auth: {
            endpoint: "POST /api/auth/login",
            constraint: "SECURITY POLICY: 5 REQUESTS / IP / MINUTE → HTTP 429",
            steps: [
                {
                    layer: "01 // HTTP GATEWAY",
                    title: "Rate Limiter & Request Validation",
                    desc: "ASP.NET Core rate-limiting middleware inspects client IP before hitting the database. Exceeding 5 login attempts per minute short-circuits with HTTP 429 ProblemDetails."
                },
                {
                    layer: "02 // APPLICATION",
                    title: "Credential & Active Status Check",
                    desc: "Authentication service validates user credentials and verifies account activation status, returning a typed Result<AuthResponse> without throwing control-flow exceptions."
                },
                {
                    layer: "03 // TOKEN ENGINE",
                    title: "JWT Issuance & Role Claims",
                    desc: "Generates a signed JWT Bearer token encoding user identity and role/policy claims required by protected administrative and licensing endpoints."
                },
                {
                    layer: "04 // VERIFICATION",
                    title: "Automated Security Tests",
                    desc: "Verified via xUnit integration tests covering valid login, inactive user rejection, unauthorized role rejection (401/403), and rate-limit threshold enforcement (429)."
                }
            ]
        },
        appointments: {
            endpoint: "POST /api/test-appointments/schedule",
            constraint: "INVARIANT: SEQUENTIAL UNLOCK (VISION → WRITTEN → STREET)",
            steps: [
                {
                    layer: "01 // API BOUNDARY",
                    title: "Authorized Request & Contract Binding",
                    desc: "Validates JWT Bearer token and binds the shared ScheduleTestAppointmentRequest DTO from DVLD.Contracts."
                },
                {
                    layer: "02 // APPLICATION RULES",
                    title: "Prerequisite & Active Appointment Guard",
                    desc: "Verifies the applicant has passed all prior test stages, has no existing unlocked appointment for the same test type, and handles retake application rules if previously failed."
                },
                {
                    layer: "03 // INFRASTRUCTURE",
                    title: "EF Core Persistence & Locking",
                    desc: "Persists the test appointment and any required retake application metadata via EF Core repositories and SQL Server foreign-key constraints."
                },
                {
                    layer: "04 // VERIFICATION",
                    title: "Unit & Integration Coverage",
                    desc: "Tested against out-of-order test scheduling attempts, duplicate open appointments, and locked-appointment mutation rules."
                }
            ]
        },
        issuance: {
            endpoint: "POST /api/licenses/issue-first-time",
            constraint: "ISOLATION LEVEL: SHARED UoW SERIALIZABLE TRANSACTION",
            steps: [
                {
                    layer: "01 // APPLICATION GUARD",
                    title: "Full Test Completion Verification",
                    desc: "Confirms the local driving license application is active, all three sequential tests (Vision, Written, Practical) are passed, and no active license already exists for that class."
                },
                {
                    layer: "02 // UNIT OF WORK",
                    title: "Begin Serializable Transaction",
                    desc: "Opens an explicit Serializable transaction on the shared scoped DbContext so driver creation, license insertion, and application completion succeed or roll back together."
                },
                {
                    layer: "03 // MULTI-REPO WRITE",
                    title: "Driver + License + Application Update",
                    desc: "Creates or links the Driver record, calculates license validity dates and fees, inserts the new License entity, and transitions the Application status to Completed."
                },
                {
                    layer: "04 // COMMIT & RESPONSE",
                    title: "Atomic Commit & CreatedAtAction",
                    desc: "Commits the Unit of Work transaction to SQL Server and returns HTTP 201 Created with the strongly-typed LicenseResponse contract."
                }
            ]
        },
        detention: {
            endpoint: "POST /api/licenses/{id}/detain | release | renew",
            constraint: "BUSINESS RULE: DETAINED LICENSES BLOCK RENEWAL & REPLACEMENT",
            steps: [
                {
                    layer: "01 // STATE CHECK",
                    title: "License Active & Detention Inspection",
                    desc: "Queries license status and detention records. Attempting to renew or replace a currently detained license immediately returns a domain Result failure mapped to ProblemDetails."
                },
                {
                    layer: "02 // DETENTION / RELEASE",
                    title: "Fine Calculation & Release Application",
                    desc: "Releasing a detained license requires creating a release application, recording fine payment and release metadata, and unlocking the license within a single transaction."
                },
                {
                    layer: "03 // RENEWAL / REPLACEMENT",
                    title: "Old License Deactivation & New Issuance",
                    desc: "During renewal or lost/damaged replacement, deactivates the previous license record and issues a linked replacement license atomically via the Unit of Work."
                },
                {
                    layer: "04 // VERIFICATION",
                    title: "Historical Test Suite Proof",
                    desc: "Covered by unit and persistence tests verifying that detained or inactive licenses cannot bypass business guards."
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
