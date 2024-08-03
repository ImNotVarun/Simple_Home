const searchInput = document.getElementById('search-input');
const cursor = document.getElementById('cursor');
const searchContainer = document.getElementById('search-container');

function updateCursorPosition() {
    const containerRect = searchContainer.getBoundingClientRect();
    const cursorX = containerRect.width / 2;
    const cursorY = containerRect.height / 2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    cursor.style.transform = 'translate(-50%, -50%)';
}

function isValidURL(string) {
    // Simple regex to check if the string looks like a domain
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    if (domainRegex.test(string)) {
        return true;
    }

    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function handleInput() {
    let input = searchInput.value.trim();

    if (isValidURL(input)) {
        if (!input.startsWith('http://') && !input.startsWith('https://')) {
            input = 'https://' + input;
        }
        window.location.href = input;
    } else {
        const query = encodeURIComponent(input);
        window.location.href = `https://www.google.com/search?q=${query}`;
    }

    // Clear the input field after handling
    searchInput.value = '';
}


searchInput.addEventListener('input', () => {
    cursor.style.display = searchInput.value ? 'none' : 'inline';
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleInput();
    }
});

window.addEventListener('resize', updateCursorPosition);
updateCursorPosition();