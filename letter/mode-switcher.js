// Mode Switcher - Shared Letter Mode Logic

// Swedish alphabet
const SWEDISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'Å', 'Ä', 'Ö'
];

// Letter frequency distribution (for daily letter)
const letterDistribution = {
    'E': 37, 'A': 35, 'N': 32, 'R': 30, 'T': 28, 'S': 24,
    'L': 19, 'I': 19, 'D': 16, 'O': 16, 'M': 13, 'K': 12,
    'G': 11, 'V': 9, 'H': 8, 'F': 7, 'U': 7, 'Ä': 7,
    'P': 6, 'Å': 5, 'Ö': 5, 'B': 5, 'C': 5, 'J': 3,
    'Y': 2, 'X': 1, 'W': 1, 'Z': 1, 'Q': 1
};

// LocalStorage keys
const STORAGE_KEYS = {
    MODE: 'letterMode',
    SELECTED_LETTER: 'selectedLetter',
    COMPLETED_LETTERS: 'completedLetters'
};

// Get current mode
function getMode() {
    return localStorage.getItem(STORAGE_KEYS.MODE) || 'daily';
}

// Set mode
function setMode(mode) {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
    updateModeUI();
}

// Get selected letter
function getSelectedLetter() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_LETTER) || 'A';
}

// Set selected letter
function setSelectedLetter(letter) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_LETTER, letter);
    setMode('select'); // Automatically switch to select mode
}

// Get completed letters
function getCompletedLetters() {
    const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_LETTERS);
    return completed ? JSON.parse(completed) : [];
}

// Mark letter as complete
function markLetterComplete(letter) {
    const completed = getCompletedLetters();
    if (!completed.includes(letter)) {
        completed.push(letter);
        localStorage.setItem(STORAGE_KEYS.COMPLETED_LETTERS, JSON.stringify(completed));
        updateLetterGrid();
    }
}

// Check if letter is completed
function isLetterCompleted(letter) {
    return getCompletedLetters().includes(letter);
}

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

// Get today's letter (daily mode)
function getTodaysLetter() {
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const calendar = generateYearCalendar();
    const index = (dayOfYear - 1) % 365;
    return calendar[index];
}

// Get active letter (respects current mode)
function getActiveLetter() {
    const mode = getMode();
    if (mode === 'daily') {
        return getTodaysLetter();
    } else {
        return getSelectedLetter();
    }
}

// Initialize mode switcher UI
function initModeSwitcher() {
    const dropdownBtn = document.getElementById('mode-dropdown-btn');
    const dropdownMenu = document.getElementById('mode-dropdown-menu');
    const letterModal = document.getElementById('letter-modal');

    if (!dropdownBtn) return; // Not all pages may have this

    // Update UI on load
    updateModeUI();

    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });

    // Mode option clicks
    document.getElementById('mode-daily').addEventListener('click', () => {
        setMode('daily');
        dropdownMenu.classList.remove('show');
        // Reload page to apply new letter
        window.location.reload();
    });

    document.getElementById('mode-select').addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
        openLetterModal();
    });

    // Letter modal
    if (letterModal) {
        // Close modal
        document.getElementById('letter-modal-close').addEventListener('click', () => {
            letterModal.classList.remove('show');
        });

        // Click outside modal
        letterModal.addEventListener('click', (e) => {
            if (e.target === letterModal) {
                letterModal.classList.remove('show');
            }
        });

        // Initialize letter grid
        initLetterGrid();
    }
}

// Update mode UI (button text, active state)
function updateModeUI() {
    const dropdownBtn = document.getElementById('mode-dropdown-btn');
    const dailyOption = document.getElementById('mode-daily');
    const selectOption = document.getElementById('mode-select');

    if (!dropdownBtn) return;

    const mode = getMode();
    const activeLetter = getActiveLetter();

    if (mode === 'daily') {
        dropdownBtn.textContent = `Dagens bokstav: ${activeLetter}`;
        dailyOption.classList.add('active');
        selectOption.classList.remove('active');
    } else {
        dropdownBtn.textContent = `Vald bokstav: ${activeLetter}`;
        dailyOption.classList.remove('active');
        selectOption.classList.add('active');
    }
}

// Open letter selection modal
function openLetterModal() {
    const letterModal = document.getElementById('letter-modal');
    if (letterModal) {
        letterModal.classList.add('show');
        updateLetterGrid();
    }
}

// Initialize letter grid
function initLetterGrid() {
    const letterGrid = document.getElementById('letter-grid');
    if (!letterGrid) return;

    letterGrid.innerHTML = '';

    SWEDISH_ALPHABET.forEach(letter => {
        const letterItem = document.createElement('div');
        letterItem.className = 'letter-item';
        letterItem.textContent = letter;
        letterItem.dataset.letter = letter;

        // Check if completed
        if (isLetterCompleted(letter)) {
            letterItem.classList.add('completed');
        }

        // Check if currently selected
        if (letter === getSelectedLetter() && getMode() === 'select') {
            letterItem.classList.add('selected');
        }

        // Click to select
        letterItem.addEventListener('click', () => {
            setSelectedLetter(letter);
            document.getElementById('letter-modal').classList.remove('show');
            // Reload page to apply new letter
            window.location.reload();
        });

        letterGrid.appendChild(letterItem);
    });
}

// Update letter grid (refresh completed/selected states)
function updateLetterGrid() {
    const letterItems = document.querySelectorAll('.letter-item');
    const selectedLetter = getSelectedLetter();
    const mode = getMode();

    letterItems.forEach(item => {
        const letter = item.dataset.letter;

        // Update completed state
        if (isLetterCompleted(letter)) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }

        // Update selected state
        if (letter === selectedLetter && mode === 'select') {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModeSwitcher);
} else {
    initModeSwitcher();
}
