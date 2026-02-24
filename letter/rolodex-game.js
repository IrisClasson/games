// Rolodex Game - Swedish Word Spelling

// Swedish words database (2-5 letters, subjects/nouns)
const SWEDISH_WORDS = {
    'A': ['and', 'arm', 'ägg', 'apa', 'al'],
    'B': ['bok', 'boll', 'blå', 'bil', 'bra', 'ben', 'bord'],
    'C': ['cd'],
    'D': ['dag', 'dörr', 'djur', 'dans', 'dra'],
    'E': ['eld', 'ek'],
    'F': ['fisk', 'fot', 'far', 'fint', 'fred'],
    'G': ['grön', 'get', 'gul', 'gräs', 'gata'],
    'H': ['hus', 'hand', 'hund', 'hår', 'höna', 'hjul'],
    'I': ['is', 'ilar'],
    'J': ['jag', 'jul', 'jord'],
    'K': ['katt', 'ko', 'kung', 'kaka', 'kula'],
    'L': ['leka', 'ljus', 'lamm', 'lik', 'lock'],
    'M': ['mat', 'mjuk', 'måne', 'mus', 'mark', 'mer', 'mask'],
    'N': ['nu', 'nära', 'nål', 'nos'],
    'O': ['orm', 'öga', 'öra', 'ont', 'ost'],
    'P': ['pappa', 'på', 'port', 'puma', 'päls'],
    'Q': ['quiz'],
    'R': ['röd', 'räv', 'ros', 'ring', 'ren', 'rot'],
    'S': ['sol', 'sjö', 'sten', 'små', 'snö', 'skog'],
    'T': ['träd', 'tand', 'tåg', 'tand', 'tid'],
    'U': ['ur', 'ute', 'uv'],
    'V': ['vit', 'varg', 'väg', 'vind', 'val'],
    'W': ['webb'],
    'X': [],
    'Y': ['yrke', 'yxa'],
    'Z': ['zebra', 'zoo'],
    'Å': ['år', 'åka', 'åt'],
    'Ä': ['äta', 'ägg', 'älg', 'än', 'ärta'],
    'Ö': ['öl', 'ö', 'öde', 'öken', 'örn']
};

// Use SWEDISH_ALPHABET from mode-switcher.js
const ALPHABET = SWEDISH_ALPHABET;

// Game state
let currentLetter = 'A';
let currentWord = '';
let letterSlots = [];
let draggedTile = null;
let hintTimer = null;
const HINT_DELAY = 15000; // 15 seconds

// DOM elements
const rolodexView = document.getElementById('rolodex-view');
const spellingView = document.getElementById('spelling-view');
const rolodexCardsContainer = document.getElementById('rolodex-cards');
const rolodexContainer = document.getElementById('rolodex-container');
const currentLetterIndicator = document.getElementById('current-letter-indicator');
const prevLetterBtn = document.getElementById('prev-letter-btn');
const nextLetterBtn = document.getElementById('next-letter-btn');
const targetWordDisplay = document.getElementById('target-word');
const speakWordBtn = document.getElementById('speak-word-btn');
const letterSlotsContainer = document.getElementById('letter-slots');
const scrambledLettersContainer = document.getElementById('scrambled-letters');
const backToRolodexBtn = document.getElementById('back-to-rolodex-btn');
const celebrationScreen = document.getElementById('celebration');
const celebrationWord = document.getElementById('celebration-word');
const nextWordBtn = document.getElementById('next-word-btn');

// Note: The following functions are provided by mode-switcher.js:
// - generateYearCalendar()
// - shuffleWithSeed()
// - getDayOfYear()
// - getTodaysLetter()
// - getActiveLetter()

// Initialize rolodex with all letters
function initRolodex() {
    rolodexCardsContainer.innerHTML = '';

    ALPHABET.forEach((letter, index) => {
        const card = createRolodexCard(letter);
        rolodexCardsContainer.appendChild(card);
    });

    // Set up scroll listener
    rolodexContainer.addEventListener('scroll', updateCurrentLetterIndicator);

    // Set up arrow navigation
    prevLetterBtn.addEventListener('click', scrollToPreviousLetter);
    nextLetterBtn.addEventListener('click', scrollToNextLetter);
}

// Create a rolodex card for a letter
function createRolodexCard(letter) {
    const card = document.createElement('div');
    card.className = 'rolodex-card';
    card.dataset.letter = letter;

    // Letter header
    const header = document.createElement('div');
    header.className = 'letter-header';

    const letterTab = document.createElement('div');
    letterTab.className = 'letter-tab';
    letterTab.textContent = letter;

    const divider = document.createElement('div');
    divider.className = 'letter-divider';

    header.appendChild(letterTab);
    header.appendChild(divider);

    // Words container
    const wordsContainer = document.createElement('div');
    wordsContainer.className = 'letter-words';

    const words = SWEDISH_WORDS[letter] || [];

    if (words.length === 0) {
        const noWords = document.createElement('div');
        noWords.className = 'no-words';
        noWords.textContent = 'Inga ord tillgängliga';
        wordsContainer.appendChild(noWords);
    } else {
        words.forEach(word => {
            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';

            const text = document.createElement('span');
            text.className = 'word-card-text';
            text.textContent = word;

            wordCard.appendChild(text);
            wordCard.addEventListener('click', () => startSpelling(word));
            wordsContainer.appendChild(wordCard);
        });
    }

    card.appendChild(header);
    card.appendChild(wordsContainer);

    return card;
}

// Update current letter indicator based on scroll position
function updateCurrentLetterIndicator() {
    const cards = document.querySelectorAll('.rolodex-card');
    const containerTop = rolodexContainer.scrollTop;
    const containerHeight = rolodexContainer.clientHeight;
    const centerPoint = containerTop + (containerHeight / 3);

    let currentCard = cards[0];

    cards.forEach(card => {
        const cardTop = card.offsetTop;
        const cardHeight = card.offsetHeight;
        const cardCenter = cardTop + (cardHeight / 2);

        if (Math.abs(cardCenter - centerPoint) < Math.abs(currentCard.offsetTop + (currentCard.offsetHeight / 2) - centerPoint)) {
            currentCard = card;
        }
    });

    currentLetter = currentCard.dataset.letter;
    currentLetterIndicator.textContent = currentLetter;

    // Update arrow button states
    const currentIndex = ALPHABET.indexOf(currentLetter);
    prevLetterBtn.disabled = currentIndex === 0;
    nextLetterBtn.disabled = currentIndex === ALPHABET.length - 1;
}

// Scroll to a specific letter
function scrollToLetter(letter) {
    const card = document.querySelector(`.rolodex-card[data-letter="${letter}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Scroll to previous letter
function scrollToPreviousLetter() {
    const currentIndex = ALPHABET.indexOf(currentLetter);
    if (currentIndex > 0) {
        scrollToLetter(ALPHABET[currentIndex - 1]);
    }
}

// Scroll to next letter
function scrollToNextLetter() {
    const currentIndex = ALPHABET.indexOf(currentLetter);
    if (currentIndex < ALPHABET.length - 1) {
        scrollToLetter(ALPHABET[currentIndex + 1]);
    }
}

// Start spelling game for selected word
function startSpelling(word) {
    currentWord = word.toUpperCase();

    // Switch views
    rolodexView.classList.add('hidden');
    spellingView.classList.remove('hidden');

    // Display word
    targetWordDisplay.textContent = currentWord;

    // Create letter slots
    createLetterSlots();

    // Create scrambled letters
    createScrambledLetters();

    // Start hint timer
    startHintTimer();

    // Speak word
    speakWord(currentWord);
}

// Create letter slots
function createLetterSlots() {
    letterSlotsContainer.innerHTML = '';
    letterSlots = [];

    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.dataset.index = i;
        slot.dataset.letter = currentWord[i];

        // Add hint text
        const hintText = document.createElement('span');
        hintText.className = 'hint-text';
        hintText.textContent = currentWord[i];
        slot.appendChild(hintText);

        // Drag events
        slot.addEventListener('dragover', handleSlotDragOver);
        slot.addEventListener('dragleave', handleSlotDragLeave);
        slot.addEventListener('drop', handleSlotDrop);

        letterSlotsContainer.appendChild(slot);
        letterSlots.push({ element: slot, filled: false, letter: null });
    }
}

// Create scrambled letters
function createScrambledLetters() {
    scrambledLettersContainer.innerHTML = '';

    // Scramble the word letters
    const letters = currentWord.split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);

    scrambled.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.draggable = true;
        tile.dataset.letter = letter;
        tile.dataset.id = `tile-${index}`;

        const text = document.createElement('span');
        text.className = 'letter-tile-text';
        text.textContent = letter;

        tile.appendChild(text);

        // Drag events
        tile.addEventListener('dragstart', handleTileDragStart);
        tile.addEventListener('dragend', handleTileDragEnd);
        tile.addEventListener('click', handleTileClick);

        scrambledLettersContainer.appendChild(tile);
    });
}

// Start hint timer
function startHintTimer() {
    // Clear existing timer
    if (hintTimer) {
        clearTimeout(hintTimer);
    }

    // Remove existing hints
    document.querySelectorAll('.letter-slot').forEach(slot => {
        slot.classList.remove('show-hint');
    });

    // Set new timer
    hintTimer = setTimeout(() => {
        document.querySelectorAll('.letter-slot:not(.filled)').forEach(slot => {
            slot.classList.add('show-hint');
        });
    }, HINT_DELAY);
}

// Drag handlers for tiles
function handleTileDragStart(e) {
    draggedTile = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleTileDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Drag handlers for slots
function handleSlotDragOver(e) {
    e.preventDefault();
    e.target.closest('.letter-slot').classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
}

function handleSlotDragLeave(e) {
    e.target.closest('.letter-slot').classList.remove('drag-over');
}

function handleSlotDrop(e) {
    e.preventDefault();
    const slot = e.target.closest('.letter-slot');
    slot.classList.remove('drag-over');

    if (!draggedTile) return;

    const slotIndex = parseInt(slot.dataset.index);
    const correctLetter = slot.dataset.letter;
    const droppedLetter = draggedTile.dataset.letter;

    // Check if the dropped letter is correct for this slot
    if (droppedLetter !== correctLetter) {
        // Wrong letter! Bounce back
        const tileToReject = draggedTile;

        // Flash the slot red
        slot.classList.add('flash-wrong');
        setTimeout(() => {
            slot.classList.remove('flash-wrong');
        }, 500);

        // Animate tile bouncing back
        tileToReject.classList.add('bounce-back');
        setTimeout(() => {
            tileToReject.classList.remove('bounce-back');
        }, 500);

        draggedTile = null;
        return; // Don't place the tile
    }

    // Correct letter! Place it in the slot

    // If slot already filled, return tile to scrambled area
    if (letterSlots[slotIndex].filled) {
        const existingTile = slot.querySelector('.letter-tile');
        if (existingTile) {
            existingTile.remove();
            scrambledLettersContainer.appendChild(existingTile);
            letterSlots[slotIndex].filled = false;
            letterSlots[slotIndex].letter = null;
            slot.classList.remove('filled');
        }
    }

    // Place the dragged tile in slot
    draggedTile.remove();
    slot.appendChild(draggedTile);
    slot.classList.add('filled');

    letterSlots[slotIndex].filled = true;
    letterSlots[slotIndex].letter = draggedTile.dataset.letter;

    draggedTile = null;

    // Auto-check if all slots are filled
    checkAnswerIfComplete();
}

// Click handler for tiles (alternative to drag)
function handleTileClick(e) {
    const tile = e.target.closest('.letter-tile');

    // If tile is in a slot, return it to scrambled area
    if (tile.parentElement.classList.contains('letter-slot')) {
        const slot = tile.parentElement;
        const slotIndex = parseInt(slot.dataset.index);

        tile.remove();
        scrambledLettersContainer.appendChild(tile);

        letterSlots[slotIndex].filled = false;
        letterSlots[slotIndex].letter = null;
        slot.classList.remove('filled');
    } else {
        // Find the first empty slot that matches this letter
        const clickedLetter = tile.dataset.letter;
        const correctSlot = letterSlots.find(s => !s.filled && s.element.dataset.letter === clickedLetter);

        if (correctSlot) {
            // Correct slot found - place the tile
            tile.remove();
            correctSlot.element.appendChild(tile);
            correctSlot.element.classList.add('filled');
            correctSlot.filled = true;
            correctSlot.letter = tile.dataset.letter;

            // Auto-check if all slots are filled
            checkAnswerIfComplete();
        } else {
            // No matching empty slot - bounce animation
            tile.classList.add('bounce-back');
            setTimeout(() => {
                tile.classList.remove('bounce-back');
            }, 500);
        }
    }
}

// Check answer automatically if all slots are filled
function checkAnswerIfComplete() {
    const allFilled = letterSlots.every(slot => slot.filled);

    if (allFilled) {
        // Small delay for better UX
        setTimeout(() => {
            checkAnswer();
        }, 300);
    }
}

// Check answer
function checkAnswer() {
    const answer = letterSlots.map(slot => slot.letter || '').join('');

    if (answer === currentWord) {
        // Correct!
        clearTimeout(hintTimer);
        showCelebration();
    } else {
        // Wrong - shake animation
        letterSlotsContainer.classList.add('shake');
        setTimeout(() => {
            letterSlotsContainer.classList.remove('shake');
        }, 400);
    }
}

// Show celebration
function showCelebration() {
    celebrationWord.textContent = currentWord;
    celebrationScreen.classList.remove('hidden');
}

// Back to rolodex
function backToRolodex() {
    clearTimeout(hintTimer);
    spellingView.classList.add('hidden');
    rolodexView.classList.remove('hidden');
}

// Text-to-speech
function speakWord(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
        utterance.lang = 'sv-SE';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// Event listeners
backToRolodexBtn.addEventListener('click', backToRolodex);
speakWordBtn.addEventListener('click', () => speakWord(currentWord));

nextWordBtn.addEventListener('click', () => {
    celebrationScreen.classList.add('hidden');
    backToRolodex();
});

// Initialize game
function initGame() {
    // Get active letter from mode-switcher.js (respects daily/select mode)
    const activeLetter = getActiveLetter();

    // Initialize rolodex
    initRolodex();

    // Scroll to the active letter
    setTimeout(() => {
        scrollToLetter(activeLetter);
    }, 100);
}

// Start game
initGame();
