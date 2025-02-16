// DOM Elements
const loadingBar = document.getElementById('loading-bar');
const searchInput = document.getElementById('search-input');
const cursor = document.getElementById('cursor');
const searchContainer = document.getElementById('search-container');
const shortcutContainer = document.getElementById('shortcut-container');
const addShortcutButton = document.getElementById('add-shortcut');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const searchEngineButtons = document.getElementById('search-engine-buttons');
const newTabToggle = document.getElementById('new-tab-toggle');
const gradientToggle = document.getElementById('gradient-toggle');

// Load shortcuts from localStorage
let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];

// Settings and state management
const settings = {
  // Set DuckDuckGo as the default search engine if none is saved
  searchEngine: localStorage.getItem('searchEngine') || 'duckduckgo',
  openInNewTab: localStorage.getItem('openInNewTab') === 'true' || false,
  gradientBackground: localStorage.getItem('gradientBackground') !== 'false',
};

// Search engine URLs (only Google and DuckDuckGo)
const searchEngines = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q='
};

// Initialize Search Engine Buttons UI
const engineButtons = searchEngineButtons.querySelectorAll('.search-engine-button');

function updateActiveEngine() {
  engineButtons.forEach(button => {
    if (button.getAttribute('data-engine') === settings.searchEngine) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

engineButtons.forEach(button => {
  button.addEventListener('click', () => {
    settings.searchEngine = button.getAttribute('data-engine');
    localStorage.setItem('searchEngine', settings.searchEngine);
    updateActiveEngine();
  });
});
updateActiveEngine();

/* Loading Bar Functions */
function startLoading() {
  loadingBar.classList.add('loading');
}

function stopLoading() {
  loadingBar.classList.remove('loading');
  // Reset the width after animation completes
  setTimeout(() => {
    loadingBar.style.width = '0';
  }, 200);
}

/* Navigation Function with Loading Bar */
function navigateWithLoading(url, newTab = false) {
  startLoading();

  if (newTab) {
    window.open(url, '_blank');
    stopLoading(); // Stop loading immediately for new tabs
  } else {
    // Add a small delay to show the loading animation
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  }
}

/* Update Cursor Position */
function updateCursorPosition() {
  const containerRect = searchContainer.getBoundingClientRect();
  const cursorX = containerRect.width / 2;
  const cursorY = containerRect.height / 2;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  cursor.style.transform = 'translate(-50%, -50%)';
}

/* URL Validation */
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

/* Handle Search Input using Loading Bar */
function handleInput() {
  let input = searchInput.value.trim();

  if (isValidURL(input)) {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      input = 'https://' + input;
    }
    navigateWithLoading(input, settings.openInNewTab);
  } else {
    const query = encodeURIComponent(input);
    const searchUrl = searchEngines[settings.searchEngine] + query;
    navigateWithLoading(searchUrl, settings.openInNewTab);
  }

  searchInput.value = '';
  cursor.style.display = 'inline';
}

/* Get Domain from URL */
function getDomainFromURL(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/* Get Favicon URL */
function getFavicon(url) {
  return `https://wilful-amethyst-butterfly.faviconkit.com/${url}/48`;
}

/* Handle Shortcut Click with Loading Bar */
function handleShortcutClick(url) {
  navigateWithLoading(url, settings.openInNewTab);
}

/* Render Shortcuts */
async function renderShortcuts() {
  shortcutContainer.innerHTML = '';
  for (const [index, shortcut] of shortcuts.entries()) {
    const shortcutElement = document.createElement('div');
    shortcutElement.className = 'shortcut';

    // Create menu button
    const menuElement = document.createElement('div');
    menuElement.className = 'shortcut-menu';
    menuElement.innerHTML = '&#x22EE;';

    // Create icon element with favicon background
    const iconElement = document.createElement('div');
    iconElement.className = 'shortcut-icon';
    const domain = getDomainFromURL(shortcut.url);
    const faviconUrl = getFavicon(domain);
    iconElement.style.backgroundImage = `url(${faviconUrl})`;

    // Create name element
    const nameElement = document.createElement('div');
    nameElement.className = 'shortcut-name';
    nameElement.textContent = shortcut.name;

    // Toggle menu options
    menuElement.onclick = (e) => {
      e.stopPropagation();
      const menuOptions = menuElement.nextElementSibling;
      const isActive = menuElement.classList.contains('active');

      // Close other active menus
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

    // Create menu options container
    const menuOptions = document.createElement('div');
    menuOptions.className = 'menu-options';

    // Edit option
    const editOption = document.createElement('div');
    editOption.textContent = 'Edit';
    editOption.onclick = (e) => {
      e.stopPropagation();
      editShortcut(index);
    };

    // Remove option
    const removeOption = document.createElement('div');
    removeOption.textContent = 'Remove';
    removeOption.onclick = (e) => {
      e.stopPropagation();
      removeShortcut(index);
    };

    menuOptions.appendChild(editOption);
    menuOptions.appendChild(removeOption);

    // Append children to shortcut element
    shortcutElement.appendChild(menuElement);
    shortcutElement.appendChild(menuOptions);
    shortcutElement.appendChild(iconElement);
    shortcutElement.appendChild(nameElement);

    // Use loading bar navigation when clicking shortcut
    shortcutElement.onclick = () => {
      handleShortcutClick(shortcut.url);
    };

    shortcutContainer.appendChild(shortcutElement);
  }
}

/* Shortcut Management Functions */
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

function removeShortcut(index) {
  shortcuts.splice(index, 1);
  saveShortcuts();
  renderShortcuts();
}

function saveShortcuts() {
  localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

/* Background Gradient Functions */
// Now generates two random colors for the gradient
function setRandomGradient() {
  if (settings.gradientBackground) {
    const colors = [
      generateRandomColor(),
      generateRandomColor()
    ];
    document.body.style.background = `linear-gradient(45deg, ${colors.join(', ')})`;
  } else {
    document.body.style.background = '#2a2828';
  }
}

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsla(${hue}, 70%, 45%, 0.8)`;
}

/* Settings Modal Handlers */
settingsButton.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent the document click handler from immediately closing it
  settingsModal.style.visibility = 'visible';
  // Use setTimeout to ensure the visibility change happens before the transform
  setTimeout(() => {
    settingsModal.classList.toggle('show');
  }, 0);
});

document.addEventListener('click', (e) => {
  if (!settingsModal.contains(e.target) && e.target !== settingsButton) {
    settingsModal.classList.remove('show');
    // Wait for the transition to complete before hiding
    setTimeout(() => {
      settingsModal.style.visibility = 'hidden';
    }, 300); // Match this with your transition duration
  }
});

/* Settings Options Handlers */
newTabToggle.addEventListener('change', (e) => {
  settings.openInNewTab = e.target.checked;
  localStorage.setItem('openInNewTab', settings.openInNewTab);
});

gradientToggle.addEventListener('change', (e) => {
  settings.gradientBackground = e.target.checked;
  localStorage.setItem('gradientBackground', settings.gradientBackground);
  setRandomGradient();
});

/* General Event Listeners */
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

/* Initialization on Page Load */
window.addEventListener('load', () => {
  searchInput.focus();
  setRandomGradient();
  updateCursorPosition();
  renderShortcuts();
});

/* Hide Shortcut Menus When Clicking Outside */
function hideMenus(event) {
  if (!event.target.closest('.shortcut')) {
    document.querySelectorAll('.shortcut-menu.active').forEach(menu => {
      menu.classList.remove('active');
      menu.nextElementSibling.style.display = 'none';
    });
  }
}
document.addEventListener('click', hideMenus);

/* Focus on the Search Input When Clicking Anywhere on the Page */
function focusSearchInput(event) {
  if (event.target !== searchInput && !searchInput.contains(event.target)) {
    searchInput.focus();
  }
}
document.addEventListener('click', focusSearchInput);
