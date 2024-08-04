const searchInput = document.getElementById('search-input');
const cursor = document.getElementById('cursor');
const searchContainer = document.getElementById('search-container');
const shortcutContainer = document.getElementById('shortcut-container');
const addShortcutButton = document.getElementById('add-shortcut');

let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];

function updateCursorPosition() {
    const containerRect = searchContainer.getBoundingClientRect();
    const cursorX = containerRect.width / 2;
    const cursorY = containerRect.height / 2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    cursor.style.transform = 'translate(-50%, -50%)';
}

function isValidURL(string) {
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

    searchInput.value = '';
    cursor.style.display = 'inline';
}

function getFaviconUrl(url) {
    try {
        const urlObject = new URL(url);
        return `https://www.google.com/s2/favicons?sz=64&domain=${urlObject.hostname}`;
    } catch (error) {
        console.error('Invalid URL:', error);
        return 'https://www.google.com/s2/favicons?sz=64&domain=example.com'; // Default favicon
    }
}

function renderShortcuts() {
    shortcutContainer.innerHTML = '';
    shortcuts.forEach((shortcut, index) => {
        const shortcutElement = document.createElement('div');
        shortcutElement.className = 'shortcut';

        const menuElement = document.createElement('div');
        menuElement.className = 'shortcut-menu';
        menuElement.innerHTML = '&#x22EE;'; // Vertical ellipsis

        const iconElement = document.createElement('div');
        iconElement.className = 'shortcut-icon';
        iconElement.style.backgroundImage = `url(${shortcut.icon})`;

        const nameElement = document.createElement('div');
        nameElement.className = 'shortcut-name';
        nameElement.textContent = shortcut.name;

        // Add menu functionality
        menuElement.onclick = (e) => {
            e.stopPropagation();
            const menuOptions = document.createElement('div');
            menuOptions.className = 'menu-options';

            const editOption = document.createElement('div');
            editOption.textContent = 'Edit';
            editOption.onclick = (e) => {
                e.stopPropagation(); // Prevent click event from propagating
                editShortcut(index);
            };

            const removeOption = document.createElement('div');
            removeOption.textContent = 'Remove';
            removeOption.onclick = (e) => {
                e.stopPropagation(); // Prevent click event from propagating
                removeShortcut(index);
            };

            menuOptions.appendChild(editOption);
            menuOptions.appendChild(removeOption);

            shortcutElement.appendChild(menuOptions);

            // Hide the menu when clicking outside
            document.addEventListener('click', function hideMenu(event) {
                if (!shortcutElement.contains(event.target)) {
                    menuOptions.remove();
                    document.removeEventListener('click', hideMenu);
                }
            });
        };

        shortcutElement.appendChild(menuElement);
        shortcutElement.appendChild(iconElement);
        shortcutElement.appendChild(nameElement);

        shortcutElement.onclick = () => window.open(shortcut.url, '_blank');

        shortcutContainer.appendChild(shortcutElement);
    });
}

function addShortcut() {
    const name = prompt('Enter shortcut name:');
    let url = prompt('Enter shortcut URL:');
    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        const icon = getFaviconUrl(url);
        shortcuts.push({ name, url, icon });
        saveShortcuts();
        renderShortcuts();
    }
}

function editShortcut(index) {
    const shortcut = shortcuts[index];
    const name = prompt('Edit shortcut name:', shortcut.name);
    let url = prompt('Edit shortcut URL:', shortcut.url);
    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        const icon = getFaviconUrl(url);
        shortcuts[index] = { name, url, icon };
        saveShortcuts();
        renderShortcuts();
    }
}

function removeShortcut(index) {
    shortcuts.splice(index, 1);
    saveShortcuts();
    renderShortcuts();
}

function saveShortcuts() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
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
addShortcutButton.onclick = addShortcut;

updateCursorPosition();
renderShortcuts();
