// settings.js
GiggiozBetterLabels.registerSettings = function () {
    const registerColorSetting = (key, name, hint, defaultColor) => {
      game.settings.register('giggioz-better-labels', key, {
        name,
        hint,
        scope: 'client',
        config: true,
        type: String,
        default: defaultColor,
      });
    };
  
    registerColorSetting('publicLabelColor', 'Public Label Background Color', 'Background color for Public messages', '#28a745');
    registerColorSetting('privateLabelColor', 'Private Label Background Color', 'Background color for Private messages', '#007bff');
    registerColorSetting('selfLabelColor', 'Self Label Background Color', 'Background color for Self messages', '#6f42c1');
    registerColorSetting('blindLabelColor', 'Blind Label Background Color', 'Background color for Blind messages', '#dc3545');
    registerColorSetting('labelTextColor', 'Label Text Color', 'Text color for all labels', '#ffffff');
  };
  