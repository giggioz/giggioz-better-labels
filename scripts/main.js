Hooks.once('ready', async () => {
  ui.notifications.info(`Giggioz better labels: ${GiggiozBetterLabels.date()}`);

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
