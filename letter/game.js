// Letter Catching Game

// Swedish alphabet
const SWEDISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'Å', 'Ä', 'Ö'
];

// Letter frequency distribution (same as main page)
const letterDistribution = {
    'E': 37, 'A': 35, 'N': 32, 'R': 30, 'T': 28, 'S': 24,
    'L': 19, 'I': 19, 'D': 16, 'O': 16, 'M': 13, 'K': 12,
    'G': 11, 'V': 9, 'H': 8, 'F': 7, 'U': 7, 'Ä': 7,
    'P': 6, 'Å': 5, 'Ö': 5, 'B': 5, 'C': 5, 'J': 3,
    'Y': 2, 'X': 1, 'W': 1, 'Z': 1, 'Q': 1
};

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

// Generate 365-day calendar (same logic as main page)
function generateYearCalendar() {
    const calendar = [];
    for (const [letter, count] of Object.entries(letterDistribution)) {
        for (let i = 0; i < count; i++) {
            calendar.push(letter);
        }
    }
    return shuffleWithSeed(calendar, 2024);
}

// Shuffle with seed for consistency
function shuffleWithSeed(array, seed) {
    const arr = [...array];
    let currentSeed = seed;
    const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Get day of year
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Get today's letter
function getTodaysLetter() {
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const calendar = generateYearCalendar();
    const index = (dayOfYear - 1) % 365;
    return calendar[index];
}

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
    if (letterChar === 'R') {
        letter.classList.add('letter-r');
    }

    letter.textContent = letterChar;
    letter.dataset.letter = letterChar;

    // Random horizontal position
    const maxX = window.innerWidth - 80;
    letter.style.left = Math.random() * maxX + 'px';

    // Random fall duration (5-8 seconds)
    const duration = 5 + Math.random() * 3;
    letter.style.animationDuration = duration + 's';

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

    if (letterChar === 'R') {
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

// Initialize today's letter
todaysLetter = getTodaysLetter();

// Start game on load
startGame();
