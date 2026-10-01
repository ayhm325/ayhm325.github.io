// ===== CANVAS PARTICLE BACKGROUND =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() * 0.5) - 0.25;
        this.speedY = (Math.random() * 0.5) - 0.25;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
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
    const count = (window.innerWidth < 768) ? 30 : 80;
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

// ===== CUSTOM CURSOR =====
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

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// ===== 3D TILT EFFECT =====
document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ===== NEURAL NETWORK SVG =====
const neuralContainer = document.querySelector('.neural-container');
const neuralCore = document.querySelector('.neural-core');
const neuralSvg = document.getElementById('neuralSvg');

const skills = [
    { name: 'C#', top: '10%', left: '20%' },
    { name: 'ASP.NET', top: '20%', left: '80%' },
    { name: 'SQL', top: '70%', left: '15%' },
    { name: 'EF Core', top: '80%', left: '70%' },
    { name: 'REST', top: '40%', left: '90%' },
    { name: 'JWT', top: '10%', left: '60%' },
    { name: 'Git', top: '90%', left: '45%' },
    { name: 'LINQ', top: '50%', left: '5%' }
];

// Create nodes and SVG lines
skills.forEach(skill => {
    const node = document.createElement('div');
    node.className = 'neural-node';
    node.innerText = skill.name;
    node.style.top = skill.top;
    node.style.left = skill.left;
    neuralContainer.appendChild(node);
    
    // Draw line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const coreRect = neuralCore.getBoundingClientRect();
    const containerRect = neuralContainer.getBoundingClientRect();
    
    // We calculate positions based on percentages relative to container
    const coreX = containerRect.width / 2;
    const coreY = containerRect.height / 2;
    const nodeX = (parseFloat(skill.left) / 100) * containerRect.width;
    const nodeY = (parseFloat(skill.top) / 100) * containerRect.height;
    
    line.setAttribute('x1', coreX);
    line.setAttribute('y1', coreY);
    line.setAttribute('x2', nodeX);
    line.setAttribute('y2', nodeY);
    line.setAttribute('stroke', 'rgba(0, 243, 255, 0.2)');
    line.setAttribute('stroke-width', '1');
    neuralSvg.appendChild(line);
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
        const sectionTop = section.offsetTop - 100;
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

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById('theme');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

// ===== YEAR =====
document.getElementById('year').textContent = new Date().getFullYear();