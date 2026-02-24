// Swedish Letter of the Day
// Letters distributed based on Swedish language frequency

// Letter frequency distribution for 365 days
// Based on Swedish letter frequency statistics
const letterDistribution = {
    'E': 37,  // Most common
    'A': 35,
    'N': 32,
    'R': 30,
    'T': 28,
    'S': 24,
    'L': 19,
    'I': 19,
    'D': 16,
    'O': 16,
    'M': 13,
    'K': 12,
    'G': 11,
    'V': 9,
    'H': 8,
    'F': 7,
    'U': 7,
    'Ä': 7,
    'P': 6,
    'Å': 5,
    'Ö': 5,
    'B': 5,
    'C': 5,
    'J': 3,
    'Y': 2,
    'X': 1,
    'W': 1,
    'Z': 1,
    'Q': 1   // Least common
};

// Generate the 365-day calendar
function generateYearCalendar() {
    const calendar = [];

    // Create array with letters repeated according to their frequency
    for (const [letter, count] of Object.entries(letterDistribution)) {
        for (let i = 0; i < count; i++) {
            calendar.push(letter);
        }
    }

    // Shuffle the calendar using a seeded random for consistency
    // Using a simple Fisher-Yates shuffle with a fixed seed
    const shuffled = shuffleWithSeed(calendar, 2024);

    return shuffled;
}

// Shuffle array with a seed for consistent results
function shuffleWithSeed(array, seed) {
    const arr = [...array];
    let currentSeed = seed;

    // Simple seeded random number generator
    const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

// Get day of year (1-365)
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear;
}

// Get letter for today
function getTodaysLetter() {
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const calendar = generateYearCalendar();

    // Use modulo to handle day 366 in leap years
    const index = (dayOfYear - 1) % 365;
    return calendar[index];
}

// Format date in Swedish
function formatDate(date) {
    const days = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    const months = [
        'januari', 'februari', 'mars', 'april', 'maj', 'juni',
        'juli', 'augusti', 'september', 'oktober', 'november', 'december'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${monthName} ${year}`;
}

// Speak the letter using text-to-speech
function speakLetter(letter) {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create speech utterance with lowercase letter to get just the sound
        const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());

        // Set Swedish language
        utterance.lang = 'sv-SE';
        utterance.rate = 0.7; // Slower for clearer pronunciation
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Speak the letter
        window.speechSynthesis.speak(utterance);

        // Add visual feedback
        const letterElement = document.getElementById('letter');
        letterElement.classList.remove('pulse');
        // Force reflow to restart animation
        void letterElement.offsetWidth;
        letterElement.classList.add('pulse');
    } else {
        console.log('Speech synthesis not supported in this browser');
    }
}

// Initialize the page
function init() {
    const letterElement = document.getElementById('letter');
    const dateElement = document.getElementById('date');

    // Get and display today's letter
    const todaysLetter = getTodaysLetter();
    letterElement.textContent = todaysLetter;

    // Add animation class
    setTimeout(() => {
        letterElement.classList.add('show');
    }, 100);

    // Display the date
    const today = new Date();
    dateElement.textContent = formatDate(today);

    // Add click event listener to letter
    letterElement.addEventListener('click', () => {
        speakLetter(todaysLetter);
    });

    // Add keyboard event listener for spacebar
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.key === ' ') {
            event.preventDefault(); // Prevent page scroll
            speakLetter(todaysLetter);
        }
    });
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
