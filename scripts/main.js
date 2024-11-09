Hooks.once('ready', async () => {
  const mode = game.modules.get('giggioz-better-labels')?.mode || 'production';
  // Fetch module version from module.json via game.modules
  const moduleVersion = game.modules.get('giggioz-better-labels')?.version || 'unknown version';

  if (mode === 'development') ui.notifications.info(`Giggioz Better Labels v${moduleVersion}: ${GiggiozBetterLabels.date()}`);

  // Open the settings menu and navigate to the module's tab
  game.settings.sheet.render(true);
  Hooks.once('renderSettingsConfig', (app, html, data) => {
    const tab = html.find('a[data-tab="giggioz-better-labels"]');
    if (tab.length) {
      tab[0].click();
    }
  });
});

Hooks.once('init', () => {
  GiggiozBetterLabels.registerSettings();
});

Hooks.on('renderSettingsConfig', GiggiozBetterLabels.setupSettingsInterface);
Hooks.on('createChatMessage', GiggiozBetterLabels.handleChatMessage);
