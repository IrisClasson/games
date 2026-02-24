// Swedish Letter of the Day
// Main page functionality

// Note: The following shared functions are provided by mode-switcher.js:
// - letterDistribution
// - generateYearCalendar()
// - shuffleWithSeed()
// - getDayOfYear()
// - getTodaysLetter()
// - getActiveLetter()

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

    // Get and display the active letter (respects mode)
    const todaysLetter = getActiveLetter();
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
