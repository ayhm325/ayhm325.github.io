(() => {
    "use strict";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    /* =========================================================
       CODE + SEA PARTICLES
       ========================================================= */

    const canvas = $("#particle-canvas");
    const ctx = canvas?.getContext("2d");

    let particles = [];
    let mouse = {
        x: null,
        y: null
    };

    const symbols = [
        "C#",
        ".NET",
        "API",
        "SQL",
        "EF",
        "JWT",
        "LINQ",
        "<>",
        "{ }",
        "=>",
        "01",
        "⚓",
        "☠",
        "✦",
        "◈"
    ];

    class Particle {

        constructor() {
            this.reset(true);
        }

        reset(random = false) {
            this.x = Math.random() * innerWidth;
            this.y = random
                ? Math.random() * innerHeight
                : innerHeight + 40;

            this.speedX = Math.random() * 0.18 - 0.09;
            this.speedY = -(Math.random() * 0.18 + 0.035);

            this.size = Math.random() * 5 + 7;
            this.opacity = Math.random() * 0.16 + 0.035;

            this.rotation = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.002 - 0.001;

            this.symbol =
                symbols[Math.floor(Math.random() * symbols.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            this.rotation += this.spin;

            if (
                this.y < -40 ||
                this.x < -60 ||
                this.x > innerWidth + 60
            ) {
                this.reset();
            }

            if (mouse.x !== null) {

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;

                const distance = Math.hypot(dx, dy);

                if (distance < 130 && distance > 0) {
                    this.x -= dx / 45;
                    this.y -= dy / 45;
                }
            }
        }

        draw() {

            if (!ctx) return;

            ctx.save();

            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.font =
                `600 ${this.size}px "Share Tech Mono", monospace`;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillStyle =
                `rgba(142,244,237,${this.opacity})`;

            ctx.fillText(this.symbol, 0, 0);

            ctx.restore();
        }
    }

    function resizeCanvas() {

        if (!canvas || !ctx) return;

        const ratio =
            Math.min(window.devicePixelRatio || 1, 1.5);

        canvas.width = innerWidth * ratio;
        canvas.height = innerHeight * ratio;

        canvas.style.width = innerWidth + "px";
        canvas.style.height = innerHeight + "px";

        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );
    }

    function initParticles() {

        if (!canvas || !ctx) return;

        const count =
            innerWidth < 700
                ? 13
                : innerWidth < 1100
                    ? 24
                    : 36;

        particles = Array.from(
            { length: count },
            () => new Particle()
        );
    }

    function animateParticles() {

        if (!canvas || !ctx) return;

        ctx.clearRect(
            0,
            0,
            innerWidth,
            innerHeight
        );

        for (const particle of particles) {
            particle.update();
            particle.draw();
        }

        requestAnimationFrame(animateParticles);
    }

    if (canvas && ctx && !reduced) {

        resizeCanvas();
        initParticles();
        animateParticles();

        addEventListener(
            "resize",
            () => {
                resizeCanvas();
                initParticles();
                updateNeuralLines();
            },
            { passive: true }
        );

        addEventListener(
            "mousemove",
            event => {
                mouse.x = event.clientX;
                mouse.y = event.clientY;
            },
            { passive: true }
        );
    }


    /* =========================================================
       PIRATE COMPASS CURSOR
       ========================================================= */

    const pirateCursor = $(".pirate-cursor");

    if (!touch && !reduced && pirateCursor) {

        addEventListener(
            "mousemove",
            event => {

                pirateCursor.style.left =
                    event.clientX + "px";

                pirateCursor.style.top =
                    event.clientY + "px";
            },
            { passive: true }
        );

        const interactiveElements = $$(
            ".magnetic, .glass-tilt, .neural-node, " +
            ".arch-layer, a, button"
        );

        interactiveElements.forEach(element => {

            element.addEventListener(
                "mouseenter",
                () => {
                    pirateCursor.classList.add("hovered");
                }
            );

            element.addEventListener(
                "mouseleave",
                () => {
                    pirateCursor.classList.remove("hovered");
                }
            );
        });
    }


    /* =========================================================
       MAGNETIC BUTTONS
       ========================================================= */

    if (!touch && !reduced) {

        $$(".magnetic").forEach(element => {

            let targetX = 0;
            let targetY = 0;

            let currentX = 0;
            let currentY = 0;

            element.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        element.getBoundingClientRect();

                    targetX =
                        (event.clientX -
                            rect.left -
                            rect.width / 2) * 0.12;

                    targetY =
                        (event.clientY -
                            rect.top -
                            rect.height / 2) * 0.12;
                }
            );

            element.addEventListener(
                "mouseleave",
                () => {
                    targetX = 0;
                    targetY = 0;
                }
            );

            const animateMagnetic = () => {

                currentX +=
                    (targetX - currentX) * 0.16;

                currentY +=
                    (targetY - currentY) * 0.16;

                element.style.transform =
                    `translate3d(${currentX}px,${currentY}px,0)`;

                requestAnimationFrame(
                    animateMagnetic
                );
            };

            animateMagnetic();
        });


        /* =====================================================
           3D TILT
           ===================================================== */

        $$("[data-tilt]").forEach(element => {

            let rotateX = 0;
            let rotateY = 0;

            let targetX = 0;
            let targetY = 0;

            element.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        element.getBoundingClientRect();

                    targetX =
                        ((event.clientY - rect.top) /
                            rect.height - 0.5) * -4;

                    targetY =
                        ((event.clientX - rect.left) /
                            rect.width - 0.5) * 4;
                }
            );

            element.addEventListener(
                "mouseleave",
                () => {
                    targetX = 0;
                    targetY = 0;
                }
            );

            const animateTilt = () => {

                rotateX +=
                    (targetX - rotateX) * 0.09;

                rotateY +=
                    (targetY - rotateY) * 0.09;

                element.style.transform =
                    `perspective(1200px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)`;

                requestAnimationFrame(
                    animateTilt
                );
            };

            animateTilt();
        });
    }


    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */

    const burger = $("#navBurger");
    const nav = $("#navLinks");

    function closeNav() {

        if (!burger || !nav) return;

        nav.classList.remove("open");

        burger.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (burger && nav) {

        burger.addEventListener(
            "click",
            () => {

                const isOpen =
                    nav.classList.toggle("open");

                burger.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
            }
        );

        $$(".nav-links a").forEach(
            link => {
                link.addEventListener(
                    "click",
                    closeNav
                );
            }
        );
    }


    /* =========================================================
       SKILLS NETWORK
       ========================================================= */

    const neuralContainer =
        $("#neuralContainer");

    const neuralCore =
        $("#neuralCore");

    const neuralSvg =
        $("#neuralSvg");

    const neuralInfo =
        $("#neuralInfo");


    const skills = [

        {
            name: "C#",
            top: "15%",
            left: "19%",
            desc: "Object-oriented, strongly typed language.",
            type: "LANGUAGE"
        },

        {
            name: "ASP.NET",
            top: "25%",
            left: "75%",
            desc: "Backend APIs and web application framework.",
            type: "FRAMEWORK"
        },

        {
            name: "SQL",
            top: "70%",
            left: "15%",
            desc: "Relational data modeling and querying.",
            type: "DATABASE"
        },

        {
            name: "EF CORE",
            top: "75%",
            left: "70%",
            desc: "ORM, queries and database integration.",
            type: "DATA ACCESS"
        },

        {
            name: "REST",
            top: "42%",
            left: "84%",
            desc: "HTTP-based API design and JSON communication.",
            type: "ARCHITECTURE"
        },

        {
            name: "JWT",
            top: "10%",
            left: "50%",
            desc: "Authentication and authorization with tokens.",
            type: "SECURITY"
        },

        {
            name: "GIT",
            top: "64%",
            left: "49.5%",
            desc: "Version control and collaborative workflows.",
            type: "TOOLS"
        },

        {
            name: "LINQ",
            top: "51%",
            left: "9%",
            desc: "Queries, projections and lambda expressions.",
            type: "LANGUAGE"
        }
    ];


    let neuralNodes = [];
    let neuralLines = [];


    function updateNeuralLines() {

        if (
            !neuralContainer ||
            !neuralCore ||
            !neuralSvg
        ) {
            return;
        }

        const containerRect =
            neuralContainer.getBoundingClientRect();

        const coreRect =
            neuralCore.getBoundingClientRect();

        const centerX =
            coreRect.left -
            containerRect.left +
            coreRect.width / 2;

        const centerY =
            coreRect.top -
            containerRect.top +
            coreRect.height / 2;


        neuralNodes.forEach(
            (node, index) => {

                const line =
                    neuralLines[index];

                if (!line) return;

                const nodeRect =
                    node.getBoundingClientRect();

                line.setAttribute(
                    "x1",
                    centerX
                );

                line.setAttribute(
                    "y1",
                    centerY
                );

                line.setAttribute(
                    "x2",
                    nodeRect.left -
                    containerRect.left +
                    nodeRect.width / 2
                );

                line.setAttribute(
                    "y2",
                    nodeRect.top -
                    containerRect.top +
                    nodeRect.height / 2
                );
            }
        );
    }


    function resetInfo() {

        if (!neuralInfo) return;

        const title =
            $(".info-title", neuralInfo);

        const type =
            $(".info-type", neuralInfo);

        const desc =
            $(".info-desc", neuralInfo);

        if (title) {
            title.textContent = "HOVER NODE";
        }

        if (type) {
            type.textContent = "TECH STACK";
        }

        if (desc) {
            desc.textContent =
                "Select a technology to view its role.";
        }
    }


    if (
        neuralContainer &&
        neuralCore &&
        neuralSvg &&
        neuralInfo
    ) {

        skills.forEach(
            (skill, index) => {

                const node =
                    document.createElement("button");

                node.type = "button";

                node.className =
                    "neural-node";

                node.textContent =
                    skill.name;

                node.style.top =
                    skill.top;

                node.style.left =
                    skill.left;

                node.setAttribute(
                    "aria-label",
                    `${skill.name}: ${skill.desc}`
                );


                const line =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "line"
                    );

                line.classList.add(
                    "neural-line"
                );


                neuralContainer.appendChild(node);

                neuralSvg.appendChild(line);

                neuralNodes.push(node);
                neuralLines.push(line);


                const activate = () => {

                    neuralLines.forEach(
                        (lineElement, lineIndex) => {

                            lineElement.classList.toggle(
                                "active",
                                lineIndex === index
                            );
                        }
                    );


                    neuralNodes.forEach(
                        (nodeElement, nodeIndex) => {

                            nodeElement.classList.toggle(
                                "dimmed",
                                nodeIndex !== index
                            );
                        }
                    );


                    const title =
                        $(".info-title", neuralInfo);

                    const type =
                        $(".info-type", neuralInfo);

                    const desc =
                        $(".info-desc", neuralInfo);


                    if (title) {
                        title.textContent =
                            skill.name;
                    }

                    if (type) {
                        type.textContent =
                            skill.type;
                    }

                    if (desc) {
                        desc.textContent =
                            skill.desc;
                    }
                };


                const deactivate = () => {

                    neuralLines.forEach(
                        lineElement => {
                            lineElement.classList.remove(
                                "active"
                            );
                        }
                    );


                    neuralNodes.forEach(
                        nodeElement => {
                            nodeElement.classList.remove(
                                "dimmed"
                            );
                        }
                    );

                    resetInfo();
                };


                node.addEventListener(
                    "mouseenter",
                    activate
                );

                node.addEventListener(
                    "focus",
                    activate
                );

                node.addEventListener(
                    "mouseleave",
                    deactivate
                );

                node.addEventListener(
                    "blur",
                    deactivate
                );
            }
        );


        requestAnimationFrame(
            updateNeuralLines
        );

        addEventListener(
            "load",
            updateNeuralLines,
            { once: true }
        );

        addEventListener(
            "resize",
            updateNeuralLines,
            { passive: true }
        );
    }


    /* =========================================================
       PROJECT ARCHITECTURE TOOLTIP
       ========================================================= */

    const tooltip =
        $("#archTooltip");

    if (tooltip) {

        $$(".arch-layer").forEach(
            layer => {

                const showTooltip = () => {

                    tooltip.textContent =
                        layer.dataset.desc || "";

                    tooltip.classList.add(
                        "visible"
                    );

                    tooltip.setAttribute(
                        "aria-hidden",
                        "false"
                    );
                };


                const hideTooltip = () => {

                    tooltip.classList.remove(
                        "visible"
                    );

                    tooltip.setAttribute(
                        "aria-hidden",
                        "true"
                    );
                };


                layer.addEventListener(
                    "mouseenter",
                    showTooltip
                );

                layer.addEventListener(
                    "focus",
                    showTooltip
                );

                layer.addEventListener(
                    "mouseleave",
                    hideTooltip
                );

                layer.addEventListener(
                    "blur",
                    hideTooltip
                );
            }
        );
    }


    /* =========================================================
       SCROLL PROGRESS + ACTIVE NAV
       ========================================================= */

    const progress =
        $("#scrollProgress");

    const sections =
        $$("main section");

    const links =
        $$(".nav-links a");


    function updateScrollUI() {

        const maxScroll =
            document.documentElement.scrollHeight -
            innerHeight;

        const percent =
            maxScroll > 0
                ? scrollY / maxScroll * 100
                : 0;


        if (progress) {

            progress.style.width =
                Math.min(
                    100,
                    Math.max(0, percent)
                ) + "%";
        }


        let currentSection = "hero";


        sections.forEach(
            section => {

                if (
                    scrollY >=
                    section.offsetTop - 180
                ) {
                    currentSection =
                        section.id;
                }
            }
        );


        links.forEach(
            link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") ===
                    "#" + currentSection
                );
            }
        );
    }


    addEventListener(
        "scroll",
        updateScrollUI,
        { passive: true }
    );

    updateScrollUI();


    /* =========================================================
       REVEAL ANIMATIONS
       ========================================================= */

    const reveals =
        $$(".reveal");


    if (
        "IntersectionObserver" in window &&
        !reduced
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );
                },
                {
                    threshold: 0.1
                }
            );


        reveals.forEach(
            element => {
                observer.observe(element);
            }
        );

    } else {

        reveals.forEach(
            element => {
                element.classList.add(
                    "visible"
                );
            }
        );
    }


    /* =========================================================
       CURRENT YEAR
       ========================================================= */

    const year =
        $("#year");

    if (year) {

        year.textContent =
            new Date().getFullYear();
    }

})();