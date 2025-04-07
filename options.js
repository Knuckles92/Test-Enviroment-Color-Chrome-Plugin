// Default URL and color
const DEFAULT_URL = "https://sonomawatertest.nexgenam.com/*";
const DEFAULT_COLOR = "red";
const AVAILABLE_COLORS = ["red", "green", "purple", "yellow"];

// Elements
const urlListElement = document.getElementById('urlList');
const addUrlButton = document.getElementById('addUrl');
const saveButton = document.getElementById('save');
const resetButton = document.getElementById('reset');

// Load saved URLs and colors or set defaults
function loadSettings() {
  chrome.storage.sync.get({ 
    sites: [{ url: DEFAULT_URL, color: DEFAULT_COLOR }] 
  }, function(items) {
    // Clear current list
    urlListElement.innerHTML = '';
    
    // Add each URL to the list
    items.sites.forEach(site => addUrlField(site.url, site.color));
    
    // If no sites are saved, add the default one
    if (items.sites.length === 0) {
      addUrlField(DEFAULT_URL, DEFAULT_COLOR);
    }
  });
}

// Add a new URL input field with color selection
function addUrlField(url = '', color = DEFAULT_COLOR) {
  const container = document.createElement('div');
  container.className = 'url-container';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'url-input';
  input.value = url;
  
  const colorSelect = document.createElement('select');
  colorSelect.className = 'color-select';
  
  // Add color options
  AVAILABLE_COLORS.forEach(availableColor => {
    const option = document.createElement('option');
    option.value = availableColor;
    option.textContent = availableColor.charAt(0).toUpperCase() + availableColor.slice(1);
    if (availableColor === color) {
      option.selected = true;
    }
    colorSelect.appendChild(option);
  });
  
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.onclick = function() {
    container.remove();
  };
  
  container.appendChild(input);
  container.appendChild(colorSelect);
  container.appendChild(removeButton);
  urlListElement.appendChild(container);
}

// Save settings
function saveSettings() {
  const containers = document.querySelectorAll('.url-container');
  const sites = Array.from(containers).map(container => {
    const url = container.querySelector('.url-input').value.trim();
    const color = container.querySelector('.color-select').value;
    return { url, color };
  }).filter(site => site.url !== '');
  
  chrome.storage.sync.set({ sites: sites }, function() {
    // Update status to let user know options were saved
    const status = document.createElement('div');
    status.textContent = 'Options saved.';
    status.style.color = 'green';
    status.style.marginTop = '10px';
    
    const controlButtons = document.querySelector('.control-buttons');
    controlButtons.appendChild(status);
    
    setTimeout(() => {
      status.remove();
    }, 2000);
    
    // Notify background script to update content scripts
    chrome.runtime.sendMessage({ action: "updateContentScripts" });
  });
}

// Reset to default
function resetToDefault() {
  urlListElement.innerHTML = '';
  addUrlField(DEFAULT_URL, DEFAULT_COLOR);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
addUrlButton.addEventListener('click', () => addUrlField());
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetToDefault); 