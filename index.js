const searchInput = document.getElementById('search-input');
const cursor = document.getElementById('cursor');
const searchContainer = document.getElementById('search-container');
const shortcutContainer = document.getElementById('shortcut-container');
const addShortcutButton = document.getElementById('add-shortcut');

let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];

// Function to update cursor position
function updateCursorPosition() {
    const containerRect = searchContainer.getBoundingClientRect();
    const cursorX = containerRect.width / 2;
    const cursorY = containerRect.height / 2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    cursor.style.transform = 'translate(-50%, -50%)';
}

// Function to validate URL
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

// Function to handle input
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

// Function to get domain from URL
function getDomainFromURL(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, '');
    } catch {
        return null;
    }
}

// Function to get Font Awesome icon
function getFontAwesomeIcon(domain) {
    const iconMap = {
        'facebook.com': 'fa-facebook',
        'twitter.com': 'fa-twitter',
        'youtube.com': 'fa-youtube',
        'google.com': 'fa-google',
        'linkedin.com': 'fa-linkedin',
        'github.com': 'fa-github',
        'amazon.com': 'fa-amazon',
        'reddit.com': 'fa-reddit',
        'instagram.com': 'fa-instagram',
    };

    return iconMap[domain] || null;
}

// Function to get favicon URL
function getFavicon(url) {
    return `https://www.google.com/s2/favicons?domain=${url}`;
}

// Function to render shortcuts
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

        const domain = getDomainFromURL(shortcut.url);
        const iconClass = getFontAwesomeIcon(domain);
        if (iconClass) {
            // Use Font Awesome icon
            iconElement.innerHTML = `<i class="fab ${iconClass}"></i>`;
        } else {
            // Use website favicon
            const faviconUrl = getFavicon(shortcut.url);
            iconElement.style.backgroundImage = `url(${faviconUrl})`;
        }

        const nameElement = document.createElement('div');
        nameElement.className = 'shortcut-name';
        nameElement.textContent = shortcut.name;

        // Add menu functionality
        menuElement.onclick = (e) => {
            e.stopPropagation();
            const menuOptions = menuElement.nextElementSibling;
            const isActive = menuElement.classList.contains('active');

            // Hide all open menus
            document.querySelectorAll('.shortcut-menu.active').forEach(menu => {
                menu.classList.remove('active');
                menu.nextElementSibling.style.display = 'none';
            });

            if (!isActive) {
                menuElement.classList.add('active');
                menuOptions.style.display = 'block';
            } else {
                menuElement.classList.remove('active');
                menuOptions.style.display = 'none';
            }
        };

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

        shortcutElement.appendChild(menuElement);
        shortcutElement.appendChild(menuOptions);
        shortcutElement.appendChild(iconElement);
        shortcutElement.appendChild(nameElement);

        shortcutElement.onclick = () => window.open(shortcut.url, '_blank');

        shortcutContainer.appendChild(shortcutElement);
    });
}

// Function to add shortcut
function addShortcut() {
    const name = prompt('Enter shortcut name:');
    let url = prompt('Enter shortcut URL:');
    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        shortcuts.push({ name, url });
        saveShortcuts();
        renderShortcuts();
    }
}

// Function to edit shortcut
function editShortcut(index) {
    const shortcut = shortcuts[index];
    const name = prompt('Edit shortcut name:', shortcut.name);
    let url = prompt('Edit shortcut URL:', shortcut.url);
    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        shortcuts[index] = { name, url };
        saveShortcuts();
        renderShortcuts();
    }
}

// Function to remove shortcut
function removeShortcut(index) {
    if (confirm('Delete this shortcut?')) {
        shortcuts.splice(index, 1);
        saveShortcuts();
        renderShortcuts();
    }
}

// Function to save shortcuts to localStorage
function saveShortcuts() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

// Event listeners
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

// Focus the search input field on page load
window.addEventListener('load', () => {
    searchInput.focus();
});

updateCursorPosition();
renderShortcuts();

// Function to hide menu when clicking outside
function hideMenus(event) {
    if (!event.target.closest('.shortcut')) {
        document.querySelectorAll('.shortcut-menu.active').forEach(menu => {
            menu.classList.remove('active');
            menu.nextElementSibling.style.display = 'none';
        });
    }
}

document.addEventListener('click', hideMenus);
