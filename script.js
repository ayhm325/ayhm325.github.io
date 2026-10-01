// ===== CANVAS PARTICLE BACKGROUND =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() * 0.3) - 0.15;
        this.speedY = (Math.random() * 0.3) - 0.15;
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        
        // Mouse interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
            this.x -= dx/20;
            this.y -= dy/20;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(0, 243, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = (window.innerWidth < 768) ? 20 : 60; // Reduced for performance
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== CUSTOM CURSOR (Lerp Physics) =====
const cursorCore = document.querySelector('.cursor-core');
const cursorRing = document.querySelector('.cursor-ring');

if (window.innerWidth > 900) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorCore.style.left = `${mouseX}px`;
        cursorCore.style.top = `${mouseY}px`;
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .glass-tilt, .neural-node').forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
}

// ===== MAGNETIC BUTTONS (Lerp Physics) =====
document.querySelectorAll('.magnetic').forEach(btn => {
    let btnX = 0, btnY = 0;
    let targetX = 0, targetY = 0;

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        targetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
        targetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
    });

    btn.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    function animateMagnet() {
        btnX += (targetX - btnX) * 0.15;
        btnY += (targetY - btnY) * 0.15;
        btn.style.transform = `translate(${btnX}px, ${btnY}px)`;
        requestAnimationFrame(animateMagnet);
    }
    animateMagnet();
});

// ===== 3D TILT EFFECT (Lerp Physics) =====
document.querySelectorAll('[data-tilt]').forEach(el => {
    let rotX = 0, rotY = 0;
    let targetRotX = 0, targetRotY = 0;

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        targetRotX = ((y - rect.height / 2) / (rect.height / 2)) * -6; // Max 6deg
        targetRotY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    });

    el.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
    });

    function animateTilt() {
        rotX += (targetRotX - rotX) * 0.1;
        rotY += (targetRotY - rotY) * 0.1;
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
        requestAnimationFrame(animateTilt);
    }
    animateTilt();
});

// ===== NEURAL NETWORK SVG =====
const neuralContainer = document.getElementById('neuralContainer');
const neuralCore = document.getElementById('neuralCore');
const neuralSvg = document.getElementById('neuralSvg');
const neuralInfo = document.getElementById('neuralInfo');

const skills = [
    { name: 'C#', top: '15%', left: '20%', desc: 'Object-Oriented, Strongly Typed', type: 'LANGUAGE' },
    { name: 'ASP.NET', top: '25%', left: '75%', desc: 'RESTful APIs, MVC', type: 'FRAMEWORK' },
    { name: 'SQL', top: '70%', left: '15%', desc: 'Relational Database Design', type: 'DATABASE' },
    { name: 'EF CORE', top: '75%', left: '70%', desc: 'ORM, Code-First Migrations', type: 'DATA ACCESS' },
    { name: 'REST', top: '40%', left: '85%', desc: 'HTTP, JSON, Swagger', type: 'ARCHITECTURE' },
    { name: 'JWT', top: '10%', left: '50%', desc: 'Authentication, Authorization', type: 'SECURITY' },
    { name: 'GIT', top: '85%', left: '45%', desc: 'Version Control, Azure DevOps', type: 'TOOLS' },
    { name: 'LINQ', top: '50%', left: '10%', desc: 'Query Expressions, Lambdas', type: 'LANGUAGE' }
];

// Clear previous lines
neuralSvg.innerHTML = '';
let nodes = [];

skills.forEach((skill, i) => {
    // Create Node
    const node = document.createElement('div');
    node.className = 'neural-node';
    node.innerText = skill.name;
    node.style.top = skill.top;
    node.style.left = skill.left;
    neuralContainer.appendChild(node);
    nodes.push(node);

    // Create SVG Line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('neural-line');
    line.setAttribute('data-node-index', i);
    neuralSvg.appendChild(line);

    // Update line coordinates on resize/load
    function updateLine() {
        const containerRect = neuralContainer.getBoundingClientRect();
        const coreRect = neuralCore.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();

        const coreX = coreRect.left - containerRect.left + coreRect.width / 2;
        const coreY = coreRect.top - containerRect.top + coreRect.height / 2;
        const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
        const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2;

        line.setAttribute('x1', coreX);
        line.setAttribute('y1', coreY);
        line.setAttribute('x2', nodeX);
        line.setAttribute('y2', nodeY);
    }
    
    updateLine();
    window.addEventListener('resize', updateLine);

    // Hover Interactions
    node.addEventListener('mouseenter', () => {
        line.classList.add('active');
        neuralInfo.querySelector('.info-title').innerText = skill.name;
        neuralInfo.querySelector('.info-desc').innerText = skill.desc;
        
        nodes.forEach((n, idx) => {
            if (idx !== i) n.classList.add('dimmed');
        });
    });

    node.addEventListener('mouseleave', () => {
        line.classList.remove('active');
        neuralInfo.querySelector('.info-title').innerText = 'HOVER NODE';
        neuralInfo.querySelector('.info-desc').innerText = 'Select a technology to view specs';
        
        nodes.forEach(n => n.classList.remove('dimmed'));
    });
});

// ===== SCROLL BEAM & ACTIVE NAV =====
const scrollBeam = document.getElementById('scrollProgress');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollBeam.style.width = `${scrollPercent}%`;
    
    // Active Nav
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (scrollTop >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== SCROLL REVEAL (IntersectionObserver) =====
const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    observer.observe(el);
});

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById('theme');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

// ===== YEAR =====
document.getElementById('year').textContent = new Date().getFullYear();