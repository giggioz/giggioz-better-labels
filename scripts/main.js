Hooks.once('ready', async () => {
  // Fetch module version from module.json via game.modules
  const moduleVersion = game.modules.get('giggioz-better-labels')?.version || 'unknown version';
  
  // Display version info in the notification
  ui.notifications.info(`Giggioz Better Labels v${moduleVersion}: ${GiggiozBetterLabels.date()}`);
  
  // Open the settings menu and navigate to the module's tab
  game.settings.sheet.render(true);
  Hooks.once('renderSettingsConfig', (app, html, data) => {
    const tab = html.find('a[data-tab="giggioz-better-labels"]');
    if (tab.length) {
      tab[0].click();
    }
  });


  if (game.user.isGM) {
    const fs = require('fs');
    const path = require('path');
    const moduleId = 'giggioz-better-labels';
    const moduleJsonPath = path.resolve('modules', moduleId, 'module.json');

    let lastVersion = game.modules.get(moduleId)?.version || 'unknown';

    fs.watchFile(moduleJsonPath, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
        const newVersion = moduleData.version;

        if (newVersion !== lastVersion) {
          ui.notifications.warn(
            `Module "${moduleId}" updated to v${newVersion}. Please restart Foundry to apply changes.`
          );
          lastVersion = newVersion;
        }
      }
    });
  }

});

Hooks.once('init', () => {
  GiggiozBetterLabels.registerSettings();
});

Hooks.on('renderSettingsConfig', GiggiozBetterLabels.setupSettingsInterface);
Hooks.on('createChatMessage', GiggiozBetterLabels.handleChatMessage);
