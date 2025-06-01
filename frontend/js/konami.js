// Versión mejorada del evento Konami
function initKonami() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                       'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                       'b', 'a'];
    let konamiIndex = 0;

    function resetKonami() {
        konamiIndex = 0;
        console.log("Secuencia resetada"); // Debug
    }

    document.addEventListener('keydown', function(e) {
        console.log("Tecla presionada:", e.key); // Debug
        
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            console.log("Secuencia correcta:", konamiIndex); // Debug
            
            if (konamiIndex === konamiCode.length) {
                activateKonamiMode();
                resetKonami();
            }
        } else {
            resetKonami();
        }
    });
}

// Iniciar solo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initKonami);

function activateKonamiMode() {
// Crear efecto visual
document.body.classList.add('konami-active');

// Mostrar mensaje secreto
const konamiAlert = document.createElement('div');
konamiAlert.className = 'konami-alert';
konamiAlert.innerHTML = `
<h2>¡SECRETO DESBLOQUEADO! 🎮</h2>
<button id="start-minigame">Iniciar Minijuego</button>
`;
document.body.appendChild(konamiAlert);

// Iniciar minijuego al hacer clic
document.getElementById('start-minigame').addEventListener('click', function() {
startMiniGame();
konamiAlert.remove();
});

// Eliminar el mensaje después de 5 segundos si no interactúan
setTimeout(() => {
if (document.querySelector('.konami-alert')) {
konamiAlert.remove();
document.body.classList.remove('konami-active');
}
}, 5000);
}

function startMiniGame() {
    const minigame = document.createElement('div');
    minigame.className = 'waifu-dodge';
    minigame.innerHTML = `
        <div class="game-header">
            <div>❤️ x <span id="lives">3</span> | 📊 <span id="score">0</span> | ⚡ <span id="power">0%</span></div>
        </div>
        <canvas id="game-canvas" width="400" height="550"></canvas>
        <div class="game-controls">
            <button id="close-game">SALIR</button>
        </div>
        <div class="crt-effect"></div>
    `;
    document.body.appendChild(minigame);

    // Configuración del juego
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameState = {
        player: { x: canvas.width/2 - 20, y: canvas.height - 60, width: 40, height: 40 },
        enemies: [],
        bullets: [],
        powerups: [],
        lives: 3,
        score: 0,
        power: 0,
        boss: null,
        isGameOver: false,
        enemyTypes: [
            { emoji: '👿', color: '#FF5252', speed: 1.5, health: 1, score: 100 },
            { emoji: '💀', color: '#9C27B0', speed: 2, health: 2, score: 150 }
        ],
        powerTypes: [
            { emoji: '❤️', color: '#FF4081', type: 'health' },
            { emoji: '⚡', color: '#00BCD4', type: 'double' }
        ]
    };

    // Controles
    const controls = {
        left: false,
        right: false,
        shoot: false
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') controls.left = true;
        if (e.key === 'ArrowRight') controls.right = true;
        if (e.key === ' ') controls.shoot = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') controls.left = false;
        if (e.key === 'ArrowRight') controls.right = false;
        if (e.key === ' ') controls.shoot = false;
    });

    // Game Loop
    function gameLoop() {
        if (gameState.isGameOver) return;
        
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    function update() {
        movePlayer();
        handleShooting();
        spawnEnemies();
        spawnPowerups();
        moveEntities();
        checkCollisions();
        checkBoss();
    }

    function movePlayer() {
        if (controls.left) gameState.player.x = Math.max(0, gameState.player.x - 7);
        if (controls.right) gameState.player.x = Math.min(canvas.width - gameState.player.width, gameState.player.x + 7);
    }

    function handleShooting() {
        if (controls.shoot && Date.now() - (gameState.lastShot || 0) > 300) {
            gameState.bullets.push({
                x: gameState.player.x + gameState.player.width/2 - 3,
                y: gameState.player.y,
                width: 6,
                height: 15
            });
            gameState.lastShot = Date.now();
        }
    }

    function spawnEnemies() {
        if (gameState.boss) return;
        
        if (Math.random() < 0.02) {
            const type = Math.floor(Math.random() * gameState.enemyTypes.length);
            const enemyType = gameState.enemyTypes[type];
            
            gameState.enemies.push({
                ...enemyType,
                x: Math.random() * (canvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                health: enemyType.health
            });
        }
        
        // Spawn de jefe cada 1500 puntos
        if (gameState.score > 0 && gameState.score % 1500 === 0 && !gameState.boss) {
            spawnBoss();
        }
    }

    function spawnBoss() {
        gameState.boss = {
            emoji: '👾',
            color: '#FF0000',
            x: canvas.width/2 - 40,
            y: 30,
            width: 80,
            height: 80,
            health: 15,
            speed: 1.5,
            direction: 1,
            score: 2000,
            lastShot: 0
        };
    }

    function spawnPowerups() {
        if (Math.random() < 0.01) {
            const type = Math.floor(Math.random() * gameState.powerTypes.length);
            gameState.powerups.push({
                ...gameState.powerTypes[type],
                x: Math.random() * (canvas.width - 30),
                y: -30,
                width: 30,
                height: 30
            });
        }
    }

    function moveEntities() {
        // Mover enemigos
        gameState.enemies.forEach(enemy => {
            enemy.y += enemy.speed;
            enemy.x += Math.sin(enemy.y * 0.05) * 1.5;
        });

        // Mover balas
        gameState.bullets.forEach(bullet => bullet.y -= 8);

        // Mover power-ups
        gameState.powerups.forEach(powerup => powerup.y += 3);

        // Mover jefe
        if (gameState.boss) {
            gameState.boss.x += gameState.boss.speed * gameState.boss.direction;
            
            if (gameState.boss.x <= 0 || gameState.boss.x >= canvas.width - gameState.boss.width) {
                gameState.boss.direction *= -1;
            }
            
            // Disparos del jefe
            if (Date.now() - gameState.boss.lastShot > 2000) {
                gameState.enemies.push({
                    emoji: '💣',
                    color: '#FF5722',
                    x: gameState.boss.x + gameState.boss.width/2 - 10,
                    y: gameState.boss.y + gameState.boss.height,
                    width: 20,
                    height: 20,
                    speed: 4,
                    health: 1,
                    score: 0,
                    isBossAttack: true
                });
                gameState.boss.lastShot = Date.now();
            }
        }
    }

    function checkCollisions() {
        // Balas vs Enemigos
        gameState.bullets.forEach((bullet, bIdx) => {
            gameState.enemies.forEach((enemy, eIdx) => {
                if (checkCollision(bullet, enemy) && !enemy.isBossAttack) {
                    enemy.health--;
                    gameState.bullets.splice(bIdx, 1);
                    
                    if (enemy.health <= 0) {
                        gameState.score += enemy.score;
                        gameState.enemies.splice(eIdx, 1);
                    }
                    updateUI();
                }
            });

            // Balas vs Jefe
            if (gameState.boss && checkCollision(bullet, gameState.boss)) {
                gameState.boss.health--;
                gameState.bullets.splice(bIdx, 1);
                
                if (gameState.boss.health <= 0) {
                    gameState.score += gameState.boss.score;
                    gameState.boss = null;
                    endGame(true); // ¡Victoria!
                }
                updateUI();
            }
        });

        // Jugador vs Enemigos
        gameState.enemies.forEach((enemy, eIdx) => {
            if (checkCollision(gameState.player, enemy)) {
                gameState.lives--;
                gameState.enemies.splice(eIdx, 1);
                updateUI();
                
                if (gameState.lives <= 0) {
                    endGame(false);
                }
            }
        });

        // Jugador vs Power-ups
        gameState.powerups.forEach((powerup, pIdx) => {
            if (checkCollision(gameState.player, powerup)) {
                if (powerup.type === 'health') {
                    gameState.lives = Math.min(3, gameState.lives + 1);
                } else if (powerup.type === 'double') {
                    gameState.power = Math.min(100, gameState.power + 25);
                }
                gameState.powerups.splice(pIdx, 1);
                updateUI();
            }
        });
    }

    function checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    function updateUI() {
        document.getElementById('lives').textContent = gameState.lives;
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('power').textContent = `${gameState.power}%`;
    }

    function checkBoss() {
        if (gameState.boss && gameState.boss.y > canvas.height) {
            gameState.boss = null;
        }
    }

    function render() {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar fondo estrellado
        ctx.fillStyle = '#1a0933';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar estrellas
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (gameState.score + i * 100) % canvas.width;
            const y = (i * 50) % canvas.height;
            ctx.fillRect(x, y, 1, 1);
        }
        
        // Dibujar jugador
        ctx.font = '30px Arial';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('👨', gameState.player.x, gameState.player.y + 30);
        
        // Dibujar enemigos
        gameState.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillText(enemy.emoji, enemy.x, enemy.y + 30);
        });
        
        // Dibujar jefe
        if (gameState.boss) {
            ctx.font = '60px Arial';
            ctx.fillStyle = gameState.boss.color;
            ctx.fillText(gameState.boss.emoji, gameState.boss.x, gameState.boss.y + 60);
            
            // Barra de vida del jefe
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(50, 10, canvas.width - 100, 10);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(50, 10, (canvas.width - 100) * (gameState.boss.health / 15), 10);
        }
        
        // Dibujar power-ups
        gameState.powerups.forEach(powerup => {
            ctx.fillStyle = powerup.color;
            ctx.fillText(powerup.emoji, powerup.x, powerup.y + 25);
        });
        
        // Dibujar balas
        gameState.bullets.forEach(bullet => {
            ctx.fillStyle = '#2196F3';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    function endGame(isVictory) {
        gameState.isGameOver = true;
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>${isVictory ? '¡VICTORIA!' : 'GAME OVER'}</h2>
            <p>Puntuación: ${gameState.score}</p>
            
            ${isVictory || gameState.score >= 2000 ? `
                <div class="coupon">
                    <p>CUPÓN: <span>OTAKU20</span></p>
                    <p>20% DE DESCUENTO</p>
                    <button id="copy-coupon">COPIAR CUPÓN</button>
                </div>
            ` : '<p>¡Consigue 2000 puntos para ganar un cupón!</p>'}
            
            <button id="restart">JUGAR DE NUEVO</button>
        `;
        minigame.appendChild(gameOverDiv);

        if (isVictory || gameState.score >= 2000) {
            document.getElementById('copy-coupon').addEventListener('click', () => {
                navigator.clipboard.writeText('OTAKU20');
                alert('¡Cupón OTAKU20 copiado! 20% de descuento en tu próxima compra');
            });
        }

        document.getElementById('restart').addEventListener('click', () => {
            gameOverDiv.remove();
            resetGame();
            gameLoop();
        });
    }

    function resetGame() {
        gameState.lives = 3;
        gameState.score = 0;
        gameState.power = 0;
        gameState.isGameOver = false;
        gameState.enemies = [];
        gameState.bullets = [];
        gameState.powerups = [];
        gameState.boss = null;
        updateUI();
    }

    // Cerrar juego
    document.getElementById('close-game').addEventListener('click', () => {
        document.body.classList.remove('konami-active');
        minigame.remove();
    });

    // Iniciar juego
    gameLoop();
}