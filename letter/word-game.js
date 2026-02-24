// Word Game - Drag and Drop

// Swedish words database (short, simple words)
const SWEDISH_WORDS = {
    'A': ['and', 'arm', 'ägg', 'apa', 'alla'],
    'B': ['bok', 'boll', 'blå', 'bil', 'bra', 'ben'],
    'C': ['cykel', 'citron'],
    'D': ['dag', 'dörr', 'djur', 'dans', 'dra'],
    'E': ['en', 'ett', 'elva', 'eld'],
    'F': ['fisk', 'fot', 'far', 'fem', 'fyra', 'fint'],
    'G': ['grön', 'god', 'get', 'gul', 'gamla'],
    'H': ['hus', 'hand', 'hund', 'hår', 'hjärta', 'höna'],
    'I': ['is', 'inte', 'illa'],
    'J': ['jag', 'jul', 'ja', 'jord'],
    'K': ['katt', 'ko', 'kruka', 'kung', 'köpa'],
    'L': ['leka', 'ljus', 'långt', 'liten', 'lamm'],
    'M': ['mat', 'mjuk', 'måne', 'mus', 'mark', 'mer'],
    'N': ['nu', 'nej', 'nära', 'ny', 'nio'],
    'O': ['och', 'orm', 'öga', 'öra', 'ont'],
    'P': ['pappa', 'på', 'plats', 'port'],
    'Q': ['quiz'],
    'R': ['röd', 'räv', 'ros', 'ring', 'ren'],
    'S': ['sol', 'sjö', 'sten', 'sju', 'sex', 'små'],
    'T': ['tre', 'två', 'tio', 'ta', 'tyst', 'träd'],
    'U': ['ur', 'ute', 'unga', 'under'],
    'V': ['vit', 'varg', 'vi', 'vatten', 'väg'],
    'W': ['webb'],
    'X': ['xylofon'],
    'Y': ['yrke', 'yngre'],
    'Z': ['zebra', 'zoolog'],
    'Å': ['åtta', 'år', 'åka', 'ålder'],
    'Ä': ['äta', 'äpple', 'älg', 'än', 'ärta'],
    'Ö': ['öl', 'ö', 'öppen', 'över', 'öde']
};

// Letter frequency distribution (same as main page)
const letterDistribution = {
    'E': 37, 'A': 35, 'N': 32, 'R': 30, 'T': 28, 'S': 24,
    'L': 19, 'I': 19, 'D': 16, 'O': 16, 'M': 13, 'K': 12,
    'G': 11, 'V': 9, 'H': 8, 'F': 7, 'U': 7, 'Ä': 7,
    'P': 6, 'Å': 5, 'Ö': 5, 'B': 5, 'C': 5, 'J': 3,
    'Y': 2, 'X': 1, 'W': 1, 'Z': 1, 'Q': 1
};

// Game state
let currentRound = 1;
const totalRounds = 5;
let todaysLetter = '';
let currentWords = [];
let draggedElement = null;
let fillLevel = 0; // Track jar fill level (0-100%)

// DOM elements
const roundDisplay = document.getElementById('current-round');
const jarLetterDisplay = document.getElementById('jar-letter');
const wordsContainer = document.getElementById('words-container');
const jarElement = document.getElementById('jar');
const jarFillElement = document.getElementById('jar-fill');
const fireworksContainer = document.getElementById('fireworks-container');
const celebrationScreen = document.getElementById('celebration');
const playAgainBtn = document.getElementById('play-again-btn');

// Firework colors
const FIREWORK_COLORS = [
    '#FF1493', '#FF6B9D', '#9D4EDD', '#FFD700', '#FF69B4',
    '#DA70D6', '#FF00FF', '#FF6347', '#FFA500', '#00CED1'
];

// Generate 365-day calendar
function generateYearCalendar() {
    const calendar = [];
    for (const [letter, count] of Object.entries(letterDistribution)) {
        for (let i = 0; i < count; i++) {
            calendar.push(letter);
        }
    }
    return shuffleWithSeed(calendar, 2024);
}

// Shuffle with seed
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

// Speak word using text-to-speech
function speakWord(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'sv-SE';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// Get random word starting with a specific letter
function getWordStartingWith(letter) {
    const words = SWEDISH_WORDS[letter.toUpperCase()];
    if (!words || words.length === 0) return null;
    return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

// Get random word NOT starting with a specific letter
function getRandomWordNotStartingWith(excludeLetter) {
    const allLetters = Object.keys(SWEDISH_WORDS).filter(l => l !== excludeLetter.toUpperCase());
    const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
    return getWordStartingWith(randomLetter).toUpperCase();
}

// Generate three words (1 correct, 2 wrong)
function generateWords() {
    const correctWord = getWordStartingWith(todaysLetter);
    const wrongWord1 = getRandomWordNotStartingWith(todaysLetter);
    const wrongWord2 = getRandomWordNotStartingWith(todaysLetter);

    // Shuffle the words
    const words = [
        { text: correctWord, correct: true },
        { text: wrongWord1, correct: false },
        { text: wrongWord2, correct: false }
    ];

    // Fisher-Yates shuffle
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }

    return words;
}

// Display words
function displayWords() {
    wordsContainer.innerHTML = '';
    currentWords = generateWords();

    currentWords.forEach(wordObj => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        wordCard.draggable = true;
        wordCard.dataset.word = wordObj.text;
        wordCard.dataset.correct = wordObj.correct;

        const wordText = document.createElement('span');
        wordText.className = 'word-text';
        wordText.textContent = wordObj.text;

        wordCard.appendChild(wordText);
        wordsContainer.appendChild(wordCard);

        // Click to hear word
        wordCard.addEventListener('click', () => {
            speakWord(wordObj.text);
        });

        // Drag events
        wordCard.addEventListener('dragstart', handleDragStart);
        wordCard.addEventListener('dragend', handleDragEnd);
    });
}

// Update jar fill level
function updateJarFill() {
    jarFillElement.style.height = fillLevel + '%';
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    jarElement.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeave(e) {
    jarElement.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    jarElement.classList.remove('drag-over');

    if (draggedElement) {
        const isCorrect = draggedElement.dataset.correct === 'true';

        if (isCorrect) {
            // Correct word!
            draggedElement.style.opacity = '0';

            // Fill jar (20% per round)
            fillLevel += 20;
            updateJarFill();

            // Fireworks after a short delay
            setTimeout(() => {
                createFireworks();
            }, 400);

            setTimeout(() => {
                nextRound();
            }, 2000);
        } else {
            // Wrong word - bounce back
            draggedElement.classList.add('bounce');
            setTimeout(() => {
                draggedElement.classList.remove('bounce');
            }, 600);
        }
    }

    return false;
}

// Create fireworks effect
function createFireworks() {
    const fireworksCount = 5;

    for (let f = 0; f < fireworksCount; f++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.6);

            createFireworkBurst(x, y);
        }, f * 200);
    }
}

function createFireworkBurst(x, y) {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';

        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        fireworksContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Next round
function nextRound() {
    currentRound++;

    if (currentRound > totalRounds) {
        showCelebration();
    } else {
        roundDisplay.textContent = currentRound;
        displayWords();
    }
}

// Show celebration
function showCelebration() {
    celebrationScreen.classList.remove('hidden');
    createFireworks();
}

// Initialize game
function initGame() {
    todaysLetter = getTodaysLetter();
    jarLetterDisplay.textContent = todaysLetter;
    currentRound = 1;
    roundDisplay.textContent = currentRound;
    celebrationScreen.classList.add('hidden');

    // Reset jar fill
    fillLevel = 0;
    updateJarFill();

    displayWords();

    // Set up drop zone
    jarElement.addEventListener('dragover', handleDragOver);
    jarElement.addEventListener('dragleave', handleDragLeave);
    jarElement.addEventListener('drop', handleDrop);

    // Play again button
    playAgainBtn.addEventListener('click', initGame);
}

// Start game
initGame();