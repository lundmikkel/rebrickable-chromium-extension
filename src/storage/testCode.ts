// Usage example
import SyncStorage from './syncStorage';

async function updateAndRetrieveTheme() {
  try {
    console.log("testing")
    // Initially set the theme to 'dark'
    await SyncStorage.set({ theme: 'dark' });
    console.log('Theme set to dark');

    // Update the theme to 'light'
    await SyncStorage.set({ theme: 'light' });
    console.log('Theme updated to light');

    // Retrieve the updated theme
    const data = await SyncStorage.get('theme');
    console.log('Retrieved theme:', data.theme); // Should log 'light'
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAndRetrieveTheme();