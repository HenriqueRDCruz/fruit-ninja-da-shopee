const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const speedElement = document.getElementById('speed');
const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');

let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
let score = 0;
let lives = 5;
let shapes = [];
let particles = [];
let gameSpeed = 1;
let spawnRate = 0.015;
let animationId;

class Shape {
    constructor() {
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = -30;

        // Formas em tamanho equilibrado
        this.size = Math.random() * 15 + 30; // 30-45 px

        // Velocidade inicial (aumenta gradualmente depois)
        let baseSpeed = Math.random() * 1.5 + 0.5; // 0.5-2.0
        this.speed = baseSpeed * gameSpeed;

        this.type = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
        this.color = this.getColor();
        this.points = this.getPoints();
    }

    getColor() {
        const colors = {
            circle: '#3b82f6',
            square: '#10b981',
            triangle: '#f59e0b'
        };
        return colors[this.type];
    }

    getPoints() {
        const points = {
            circle: 10,
            square: 15,
            triangle: 20
        };
        return points[this.type];
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'square') {
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            ctx.strokeRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else if (this.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x - this.size, this.y + this.size);
            ctx.lineTo(this.x + this.size, this.y + this.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    isClicked(mouseX, mouseY) {
        if (this.type === 'circle') {
            const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
            return distance < this.size;
        } else if (this.type === 'square') {
            return mouseX > this.x - this.size &&
                mouseX < this.x + this.size &&
                mouseY > this.y - this.size &&
                mouseY < this.y + this.size;
        } else if (this.type === 'triangle') {
            // Detecção simplificada para triângulo
            const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
            return distance < this.size * 1.2;
        }
        return false;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 5;
    shapes = [];
    particles = [];
    gameSpeed = 1;
    spawnRate = 0.015;

    menuScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    updateUI();
    gameLoop();
}

function restartGame() {
    startGame();
}

function goToMenu() {
    gameState = 'menu';
    cancelAnimationFrame(animationId);
    menuScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
}

function gameOver() {
    gameState = 'gameOver';
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    speedElement.textContent = gameSpeed.toFixed(1) + 'x';
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function gameLoop() {
    if (gameState !== 'playing') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < spawnRate) {
        shapes.push(new Shape());
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        shape.update();
        shape.draw();

        if (shape.y > canvas.height + shape.size) {
            shapes.splice(i, 1);
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Dificuldade sobe mais devagar e gradualmente
    gameSpeed = 1 + score * 0.003; // crescimento mais lento
    spawnRate = Math.min(0.03, 0.015 + score * 0.00003); // aumenta devagar

    animationId = requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.isClicked(mouseX, mouseY)) {
            score += shape.points;
            updateUI();
            createExplosion(shape.x, shape.y, shape.color);
            shapes.splice(i, 1);
            break;
        }
    }
});

updateUI();
