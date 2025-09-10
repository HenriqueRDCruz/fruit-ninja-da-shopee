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
let lives = 5; // Aumentado para 5 vidas
let shapes = [];
let particles = [];
let gameSpeed = 1;
let spawnRate = 0.02;
let animationId;
let difficulty = 'easy'; // Padrão: modo fácil

class Shape {
    constructor() {
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = -30;

        // No modo fácil, formas são maiores
        if (difficulty === 'easy') {
            this.size = Math.random() * 15 + 30; // 30-45
        } else if (difficulty === 'normal') {
            this.size = Math.random() * 20 + 25; // 25-45
        } else {
            this.size = Math.random() * 20 + 20; // 20-40
        }

        // Velocidade baseada na dificuldade
        let baseSpeed;
        if (difficulty === 'easy') {
            baseSpeed = Math.random() * 1.5 + 0.5; // 0.5-2.0
        } else if (difficulty === 'normal') {
            baseSpeed = Math.random() * 2 + 1; // 1-3
        } else {
            baseSpeed = Math.random() * 3 + 1.5; // 1.5-4.5
        }

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
            // Simplificação da detecção de clique para triângulo
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

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty || 'easy';
    gameState = 'playing';
    score = 0;

    // Mais vidas no modo fácil
    if (difficulty === 'easy') {
        lives = 5;
    } else if (difficulty === 'normal') {
        lives = 4;
    } else {
        lives = 3;
    }

    shapes = [];
    particles = [];
    gameSpeed = 1;

    // Taxa de spawn mais baixa no modo fácil
    if (difficulty === 'easy') {
        spawnRate = 0.015;
    } else if (difficulty === 'normal') {
        spawnRate = 0.02;
    } else {
        spawnRate = 0.025;
    }

    menuScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    updateUI();
    gameLoop();
}

function restartGame() {
    startGame(difficulty);
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

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawnar novas formas
    if (Math.random() < spawnRate) {
        shapes.push(new Shape());
    }

    // Atualizar formas
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        shape.update();
        shape.draw();

        // Verificar se a forma tocou o chão
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

    // Atualizar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Aumentar dificuldade mais lentamente no modo fácil
    if (difficulty === 'easy') {
        gameSpeed = 1 + score * 0.005; // Aumento mais lento
        spawnRate = Math.min(0.03, 0.015 + score * 0.00005); // Aumento mais lento
    } else if (difficulty === 'normal') {
        gameSpeed = 1 + score * 0.01;
        spawnRate = Math.min(0.04, 0.02 + score * 0.0001);
    } else {
        gameSpeed = 1 + score * 0.015; // Aumento mais rápido
        spawnRate = Math.min(0.05, 0.025 + score * 0.00015); // Aumento mais rápido
    }

    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
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

// Inicializar
updateUI();