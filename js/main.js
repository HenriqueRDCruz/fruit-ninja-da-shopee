document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const speedElement = document.getElementById('speed');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const rulesButton = document.getElementById('rules-button');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesButton = document.getElementById('close-rules');

    // Variáveis do jogo
    let score = 0;
    let lives = 3;
    let speed = 1;
    let gameInterval;
    let shapeInterval;
    let isGameRunning = false;
    let isPaused = false;
    let shapes = [];

    // Cores para as formas
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE'];

    // Iniciar o jogo
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    rulesButton.addEventListener('click', showRules);
    closeRulesButton.addEventListener('click', hideRules);

    function startGame() {
        // Reiniciar variáveis
        score = 0;
        lives = 3;
        speed = 1;
        shapes = [];
        isPaused = false;

        // Atualizar UI
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        speedElement.textContent = speed + 'x';
        gameOverScreen.style.display = 'none';
        pauseButton.textContent = 'Pausar';
        pauseButton.disabled = false;

        // Limpar o container do jogo
        gameContainer.innerHTML = '';
        gameContainer.appendChild(gameOverScreen);

        // Iniciar loops do jogo
        isGameRunning = true;
        startButton.disabled = true;

        // Gerar formas em intervalos
        clearInterval(shapeInterval);
        shapeInterval = setInterval(createShape, 1000);

        // Loop principal do jogo
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 16);
    }

    function createShape() {
        if (!isGameRunning || isPaused) return;

        // Criar uma nova forma
        const shape = document.createElement('div');
        shape.className = 'shape';

        // Tipos de formas: quadrado, círculo, triângulo
        const shapeTypes = ['square', 'circle', 'triangle'];
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

        // Definir estilo baseado no tipo
        const size = 40 + Math.random() * 30;
        const color = colors[Math.floor(Math.random() * colors.length)];

        shape.style.width = size + 'px';
        shape.style.height = size + 'px';
        shape.style.backgroundColor = color;

        if (randomType === 'circle') {
            shape.classList.add('circle');
        } else if (randomType === 'triangle') {
            shape.classList.add('triangle');
        }

        // Adicionar valor de pontos
        shape.innerHTML = '10';

        // Posição horizontal aleatória
        const maxLeft = gameContainer.offsetWidth - size;
        shape.style.left = Math.random() * maxLeft + 'px';
        shape.style.top = '0px';

        // Adicionar ao container
        gameContainer.appendChild(shape);

        // Adicionar evento de clique
        shape.addEventListener('click', () => {
            if (!isGameRunning || isPaused) return;

            // Efeito visual ao clicar
            shape.style.transform = 'scale(1.2)';
            shape.style.opacity = '0.5';

            // Remover forma após breve delay
            setTimeout(() => {
                shape.remove();
            }, 200);

            // Aumentar pontuação
            score += 10;
            scoreElement.textContent = score;

            // Aumentar velocidade a cada 50 pontos
            if (score % 50 === 0) {
                speed += 0.2;
                speedElement.textContent = speed.toFixed(1) + 'x';
            }
        });

        // Guardar referência da forma
        shapes.push({
            element: shape,
            speed: 1 + Math.random() * 2,
            isClicked: false
        });
    }

    function updateGame() {
        if (!isGameRunning || isPaused) return;

        // Mover todas as formas
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            // Se a forma foi clicada, pular
            if (shape.isClicked) continue;

            // Obter posição atual
            const currentTop = parseFloat(shape.element.style.top || 0);

            // Atualizar posição
            const newTop = currentTop + shape.speed * speed;
            shape.element.style.top = newTop + 'px';

            // Verificar se chegou ao fundo
            if (newTop > gameContainer.offsetHeight) {
                // Remover forma
                shape.element.remove();
                shapes[i].isClicked = true;

                // Reduzir vida
                lives--;
                livesElement.textContent = lives;

                // Verificar fim de jogo
                if (lives <= 0) {
                    endGame();
                }
            }
        }

        // Limpar formas que já foram removidas
        shapes = shapes.filter(shape => {
            return !shape.isClicked && document.contains(shape.element);
        });
    }

    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Continuar' : 'Pausar';
    }

    function endGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        clearInterval(shapeInterval);

        // Mostrar tela de fim de jogo
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
        startButton.disabled = false;
        pauseButton.disabled = true;
    }

    function showRules() {
        rulesModal.style.display = 'flex';
    }

    function hideRules() {
        rulesModal.style.display = 'none';
    }

    // Mostrar regras no início
    showRules();
});