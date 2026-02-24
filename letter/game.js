// Letter Catching Game

// Note: The following shared resources are provided by mode-switcher.js:
// - SWEDISH_ALPHABET
// - letterDistribution
// - generateYearCalendar()
// - shuffleWithSeed()
// - getDayOfYear()
// - getTodaysLetter()
// - getActiveLetter()

// Game state
let score = 0;
let timeRemaining = 60;
let gameActive = false;
let spawnInterval;
let timerInterval;
let todaysLetter = '';
let letterCount = 0; // Track spawned letters

// DOM elements
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameArea = document.getElementById('game-area');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Particle colors for explosion
const PARTICLE_COLORS = [
    '#FF1493', '#FF6B9D', '#9D4EDD', '#FFD700', '#FF69B4',
    '#FF1493', '#DA70D6', '#FF00FF', '#FF6347', '#FFA500'
];

// Get random letter from Swedish alphabet
// Every 4th or 5th letter is today's letter
function getRandomLetter() {
    letterCount++;

    // Every 4th or 5th letter (randomly alternate between 4 and 5)
    const interval = Math.random() < 0.5 ? 4 : 5;

    if (letterCount % interval === 0) {
        return todaysLetter;
    }

    return SWEDISH_ALPHABET[Math.floor(Math.random() * SWEDISH_ALPHABET.length)];
}

// Create falling letter
function createFallingLetter() {
    if (!gameActive) return;

    const letter = document.createElement('div');
    const letterChar = getRandomLetter();

    letter.className = 'falling-letter';
    if (letterChar === todaysLetter) {
        letter.classList.add('target-letter');
    }

    letter.textContent = letterChar;
    letter.dataset.letter = letterChar;

    // Random horizontal position
    const maxX = window.innerWidth - 80;
    letter.style.left = Math.random() * maxX + 'px';

    // Random fall duration (5-8 seconds)
    const duration = 5 + Math.random() * 3;
    letter.style.setProperty('--fall-duration', duration + 's');

    // Add click handler
    letter.addEventListener('click', () => handleLetterClick(letter, letterChar));

    gameArea.appendChild(letter);

    // Remove letter after animation completes
    setTimeout(() => {
        if (letter.parentNode === gameArea) {
            letter.remove();
        }
    }, duration * 1000);
}

// Handle letter click
function handleLetterClick(letterElement, letterChar) {
    if (!gameActive) return;

    const rect = letterElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (letterChar === todaysLetter) {
        // Correct letter - add point and explode
        score++;
        scoreDisplay.textContent = score;
        createExplosion(x, y);
    } else {
        // Wrong letter - lose point
        score = Math.max(0, score - 1); // Don't go below 0
        scoreDisplay.textContent = score;
    }

    // Remove the letter
    letterElement.remove();
}

// Create colorful particle explosion
function createExplosion(x, y) {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random color
        particle.style.backgroundColor = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        // Position at click point
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Random direction and distance
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

// Update timer
function updateTimer() {
    timeRemaining--;
    timerDisplay.textContent = timeRemaining;

    if (timeRemaining <= 0) {
        endGame();
    }
}

// Start game
function startGame() {
    // Reset state
    score = 0;
    timeRemaining = 60;
    gameActive = true;
    letterCount = 0; // Reset letter counter

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeRemaining;
    gameOverScreen.classList.add('hidden');

    // Clear any existing letters
    gameArea.innerHTML = '';

    // Start spawning letters
    spawnInterval = setInterval(createFallingLetter, 800); // Spawn every 0.8 seconds

    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
}

// End game
function endGame() {
    gameActive = false;

    // Clear intervals
    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    // Show game over screen
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');

    // Clear remaining letters
    setTimeout(() => {
        gameArea.innerHTML = '';
    }, 1000);
}

// Event listeners
restartBtn.addEventListener('click', startGame);

// Initialize the active letter (respects mode)
todaysLetter = getActiveLetter();

// Start game on load
startGame();
