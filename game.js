 const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 600;
        
        // Paddle properties
        const paddleWidth = 10;
        const paddleHeight = 100;
        let leftPaddleY = (canvas.height - paddleHeight) / 2;
        let rightPaddleY = (canvas.height - paddleHeight) / 2;
        const paddleSpeed = 6;
        
        // Ball properties
        let ballX = canvas.width / 2;
        let ballY = canvas.height / 2;
        const ballRadius = 10;
        let ballSpeedX = 5;
        let ballSpeedY = 5;
        
        // Game state
        let isSinglePlayer = true;
        let leftScore = 0;
        let rightScore = 0;
        let gameRunning = false; // Changed to false so game doesn't start automatically
        let gameStarted = false;  // New variable to track if game has been started
        const winningScore = 5;
        
        // Key states for smooth movement
        const keys = {
            w: false,
            s: false,
            ArrowUp: false,
            ArrowDown: false
        };
        
        // Function to draw the center line
        function drawCenterLine() {
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }
        
        // Function to draw paddles and ball
        function draw() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set fill color to white
            ctx.fillStyle = '#fff';
            
            // Draw center line
            drawCenterLine();
            
            // Draw left paddle
            ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
            
            // Draw right paddle
            ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
            
            // Draw ball
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Function to update game state
        function update() {
            if (!gameRunning || !gameStarted) return;
            
            // Move ball
            ballX += ballSpeedX;
            ballY += ballSpeedY;
            
            // Ball collision with top and bottom walls
            if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvas.height) {
                ballSpeedY = -ballSpeedY;
            }
            
            // Ball collision with left paddle
            if (ballX - ballRadius <= paddleWidth && 
                ballY >= leftPaddleY && 
                ballY <= leftPaddleY + paddleHeight) {
                ballSpeedX = Math.abs(ballSpeedX); // Ensure ball goes right
                
                // Add some angle based on where the ball hits the paddle
                const paddleCenter = leftPaddleY + paddleHeight / 2;
                const hitPos = (ballY - paddleCenter) / (paddleHeight / 2);
                ballSpeedY = hitPos * 5;
            }
            
            // Ball collision with right paddle
            if (ballX + ballRadius >= canvas.width - paddleWidth && 
                ballY >= rightPaddleY && 
                ballY <= rightPaddleY + paddleHeight) {
                ballSpeedX = -Math.abs(ballSpeedX); // Ensure ball goes left
                
                // Add some angle based on where the ball hits the paddle
                const paddleCenter = rightPaddleY + paddleHeight / 2;
                const hitPos = (ballY - paddleCenter) / (paddleHeight / 2);
                ballSpeedY = hitPos * 5;
            }
            
            // Score when ball goes off screen
            if (ballX < 0) {
                rightScore++;
                resetBall();
                updateScore();
            } else if (ballX > canvas.width) {
                leftScore++;
                resetBall();
                updateScore();
            }
            
            // Check for game over
            if (leftScore >= winningScore || rightScore >= winningScore) {
                gameOver();
                return;
            }
            
            // Handle paddle movement based on key states
            if (keys.w && leftPaddleY > 0) {
                leftPaddleY -= paddleSpeed;
            }
            if (keys.s && leftPaddleY < canvas.height - paddleHeight) {
                leftPaddleY += paddleSpeed;
            }
            
            // Right paddle movement (only in multiplayer mode)
            if (!isSinglePlayer) {
                if (keys.ArrowUp && rightPaddleY > 0) {
                    rightPaddleY -= paddleSpeed;
                }
                if (keys.ArrowDown && rightPaddleY < canvas.height - paddleHeight) {
                    rightPaddleY += paddleSpeed;
                }
            }
            
            // AI for single player mode
            if (isSinglePlayer) {
                const paddleCenter = rightPaddleY + paddleHeight / 2;
                const aiSpeed = 4; // Slightly slower than player for fairness
                
                if (ballY < paddleCenter - 10) {
                    rightPaddleY = Math.max(0, rightPaddleY - aiSpeed);
                } else if (ballY > paddleCenter + 10) {
                    rightPaddleY = Math.min(canvas.height - paddleHeight, rightPaddleY + aiSpeed);
                }
            }
            
            // Keep paddles within canvas bounds
            leftPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddleY));
            rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
        }
        
        // Function to reset ball to center
        function resetBall() {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            
            // Random direction for ball
            ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
            ballSpeedY = (Math.random() - 0.5) * 8;
        }
        
        // Function to update score display
        function updateScore() {
            const scoreElement = document.getElementById('score');
            const rightLabel = isSinglePlayer ? 'AI' : 'Player 2';
            scoreElement.textContent = `Player: ${leftScore} | ${rightLabel}: ${rightScore}`;
        }
        
        // Function to handle game over
        function gameOver() {
            gameRunning = false;
            const gameOverDiv = document.getElementById('gameOver');
            const gameOverText = document.getElementById('gameOverText');
            
            if (leftScore >= winningScore) {
                gameOverText.textContent = 'Player Wins!';
            } else {
                const winner = isSinglePlayer ? 'AI Wins!' : 'Player 2 Wins!';
                gameOverText.textContent = winner;
            }
            
            gameOverDiv.style.display = 'block';
        }
        
        // Function to start the game
        function startGame() {
            gameStarted = true;
            gameRunning = true;
            document.getElementById('startScreen').style.display = 'none';
            resetBall();
        }
        
        // Function to reset the entire game
        function resetGame() {
            leftScore = 0;
            rightScore = 0;
            gameRunning = true;
            gameStarted = true; // Keep game started when resetting
            leftPaddleY = (canvas.height - paddleHeight) / 2;
            rightPaddleY = (canvas.height - paddleHeight) / 2;
            resetBall();
            updateScore();
            document.getElementById('gameOver').style.display = 'none';
        }
        
        // Game loop
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        // Input handlers for keydown
        document.addEventListener('keydown', (e) => {
            if (e.key in keys) {
                keys[e.key] = true;
                e.preventDefault(); // Prevent default browser behavior
            }
        });
        
        // Input handlers for keyup
        document.addEventListener('keyup', (e) => {
            if (e.key in keys) {
                keys[e.key] = false;
                e.preventDefault();
            }
        });
        
        // Button event listeners
        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            isSinglePlayer = true;
            document.getElementById('singlePlayerBtn').classList.add('active');
            document.getElementById('multiPlayerBtn').classList.remove('active');
            // Don't reset game here, just change mode
        });
        
        document.getElementById('multiPlayerBtn').addEventListener('click', () => {
            isSinglePlayer = false;
            document.getElementById('multiPlayerBtn').classList.add('active');
            document.getElementById('singlePlayerBtn').classList.remove('active');
            // Don't reset game here, just change mode
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            resetGame();
        });
        
        // Start button event listener
        document.getElementById('startBtn').addEventListener('click', () => {
            startGame();
        });
        
        // Initialize the game
        updateScore();
        gameLoop();