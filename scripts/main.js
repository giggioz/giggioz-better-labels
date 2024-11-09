Hooks.once('ready', () => {
  const mode = window.GiggiozBetterLabels.mode;
  const version = game.modules.get('giggioz-better-labels')?.version || 'unknown';

  if (mode === 'development') {
    ui.notifications.info(`Giggioz Better Labels v${version} running in ${mode} mode.`);

    // Open the settings menu and navigate to the module's tab
    game.settings.sheet.render(true);
    Hooks.once('renderSettingsConfig', (app, html, data) => {
      const tab = html.find('a[data-tab="giggioz-better-labels"]');
      if (tab.length) {
        tab[0].click();
      }
    });
  }
});

Hooks.once('init', GiggiozBetterLabels.registerSettings);
Hooks.on('renderSettingsConfig', GiggiozBetterLabels.setupSettingsInterface);
Hooks.on('createChatMessage', GiggiozBetterLabels.handleChatMessage);
