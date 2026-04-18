let isOpened = false;
let isAnimating = false;
let bgmStarted = false;

const audioPop = document.getElementById('audio-pop');
const audioPaper = document.getElementById('audio-paper');
const audioBgm = document.getElementById('audio-bgm');

const envelopeWrapper = document.getElementById('envelope-wrapper');
const floatWrapper = document.getElementById('float-wrapper');
const closeBtn = document.getElementById('close-btn');

function toggleMail(e) {
    if (e) e.stopPropagation();
    if (isAnimating) return;

    if (!isOpened) {
        openMail();
    } else {
        closeMail();
    }
}

function openMail() {
    isAnimating = true;

    audioPop.currentTime = 0;
    audioPop.volume = 0.8;
    audioPop.play().catch(err => console.log('Audio blocked'));

    envelopeWrapper.classList.add('is-open');
    floatWrapper.classList.add('is-open');

    createConfetti();

    setTimeout(() => {
        audioPaper.currentTime = 0;
        audioPaper.volume = 0.6;
        audioPaper.play().catch(err => console.log('Audio blocked'));

        if (!bgmStarted) {
            audioBgm.volume = 0.4;
            audioBgm.play().catch(err => console.log('Music blocked'));
            bgmStarted = true;
        }

        setTimeout(() => {
            floatWrapper.classList.add('is-reading-mode');
            envelopeWrapper.classList.add('is-reading');
            
            setTimeout(() => {
                envelopeWrapper.classList.add('is-reading-text');
                
                // Removed show close button

                isOpened = true;
                isAnimating = false;
            }, 600);

        }, 800);

    }, 400);
}

function closeMail() {
    isAnimating = true;

    // hidden close button

    audioPaper.currentTime = 0;
    audioPaper.play();

    envelopeWrapper.classList.remove('is-reading-text');
    
    setTimeout(() => {
        envelopeWrapper.classList.remove('is-reading');
        floatWrapper.classList.remove('is-reading-mode');
        
        setTimeout(() => {
            envelopeWrapper.classList.remove('is-open');
            floatWrapper.classList.remove('is-open');
            isOpened = false;
            isAnimating = false;
        }, 1000);
    }, 500);
}

// ----------------------------------------------------
// Magical Particle Canvas Effect
// ----------------------------------------------------
const canvas = document.getElementById('magic-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Explode entirely upwards and outwards
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 8;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity - 5; // Bias towards going up
        this.size = Math.random() * 12 + 4;
        this.color = this.getRandomColor();
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.005;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 5;
        // Shapes: 0=circle, 1=heart, 2=star
        this.shape = Math.floor(Math.random() * 3);
    }
    
    getRandomColor() {
        const colors = ['#fecdd3', '#fbcfe8', '#fda4af', '#f43f5e', '#ffffff', '#fde047'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        if (this.shape === 0) {
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 1) {
            // Heart shape
            const s = this.size / 20;
            ctx.moveTo(0, 5 * s);
            ctx.bezierCurveTo(0, 5*s, 0, 0, -5*s, 0);
            ctx.bezierCurveTo(-10*s, 0, -10*s, 10*s, -10*s, 10*s);
            ctx.bezierCurveTo(-10*s, 15*s, 0, 20*s, 0, 25*s);
            ctx.bezierCurveTo(0, 20*s, 10*s, 15*s, 10*s, 10*s);
            ctx.bezierCurveTo(10*s, 10*s, 10*s, 0, 5*s, 0);
            ctx.bezierCurveTo(0, 0, 0, 5*s, 0, 5*s);
            ctx.fill();
        } else {
            // Star shape
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size,
                           -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
                ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2.5),
                           -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2.5));
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity
        this.rotation += this.rotationSpeed;
        this.alpha -= this.decay;
    }
}

function createConfetti() {
    clearTimeout(animationFrameId);
    
    const sealElement = document.getElementById('seal');
    const rect = sealElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(centerX, centerY));
    }
    
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
    }
    
    // Remove dead particles
    particles = particles.filter(p => p.alpha > 0);
    
    if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animateParticles);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
