// Default URL pattern and color
const DEFAULT_URL = "https://sonomawatertest.nexgenam.com/*";
const DEFAULT_COLOR = "red";

// Keep track of registered content scripts
let registeredScriptIds = [];

// Initialize extension
function initialize() {
  // Load saved sites or use default
  chrome.storage.sync.get({ 
    sites: [{ url: DEFAULT_URL, color: DEFAULT_COLOR }] 
  }, function(items) {
    registerContentScripts(items.sites);
  });
}

// Register content scripts for each site (URL + color)
async function registerContentScripts(sites) {
  // Remove any previously registered scripts
  await unregisterContentScripts();
  
  // Skip if no sites
  if (!sites || sites.length === 0) {
    return;
  }
  
  try {
    // Register content script for each site
    for (const site of sites) {
      if (site.url.trim() === '') continue;
      
      const scriptId = `content-script-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const cssFile = `${site.color}Style.css`;
      
      await chrome.scripting.registerContentScripts([{
        id: scriptId,
        matches: [site.url],
        js: ['content.js'],
        css: [cssFile],
        runAt: 'document_idle'
      }]);
      
      registeredScriptIds.push(scriptId);
    }
  } catch (error) {
    console.error("Error registering content scripts:", error);
  }
}

// Unregister all previously registered content scripts
async function unregisterContentScripts() {
  try {
    for (const scriptId of registeredScriptIds) {
      try {
        await chrome.scripting.unregisterContentScripts({
          ids: [scriptId]
        });
      } catch (error) {
        console.error(`Error unregistering script ${scriptId}:`, error);
      }
    }
    registeredScriptIds = [];
  } catch (error) {
    console.error("Error unregistering content scripts:", error);
  }
}

// Listen for messages from options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateContentScripts") {
    chrome.storage.sync.get({ 
      sites: [{ url: DEFAULT_URL, color: DEFAULT_COLOR }] 
    }, function(items) {
      registerContentScripts(items.sites);
    });
  }
});

// Initialize on installation or update
chrome.runtime.onInstalled.addListener(initialize);

// Initial setup
initialize(); 