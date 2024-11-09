const date = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

Hooks.once('ready', async () => {
  // TODO TO BE DONE ONLY IN DEV
  ui.notifications.info(`Giggioz better labels: ${date()}`);
  // Open the settings menu
  game.settings.sheet.render(true);
  Hooks.once('renderSettingsConfig', (app, html, data) => {
    const tab = html.find('a[data-tab="giggioz-better-labels"]');
    if (tab.length) {
      tab[0].click();
    }
  });
});

Hooks.once('init', () => {
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

  // Register settings
  registerColorSetting('publicLabelColor', 'Public Label Background Color', 'Background color for Public messages', '#28a745');
  registerColorSetting('privateLabelColor', 'Private Label Background Color', 'Background color for Private messages', '#007bff');
  registerColorSetting('selfLabelColor', 'Self Label Background Color', 'Background color for Self messages', '#6f42c1');
  registerColorSetting('blindLabelColor', 'Blind Label Background Color', 'Background color for Blind messages', '#dc3545');
  registerColorSetting('labelTextColor', 'Label Text Color', 'Text color for all labels', '#ffffff');
});

//////////////
//////////////
//////////////

Hooks.on('renderSettingsConfig', (app, html, data) => {
  if (app.constructor.name !== 'SettingsConfig') return;

  const colorFields = [
    { key: 'publicLabelColor', label: 'Public Message Example' },
    { key: 'privateLabelColor', label: 'Private Message Example' },
    { key: 'selfLabelColor', label: 'Self Message Example' },
    { key: 'blindLabelColor', label: 'Blind Message Example' }
  ];

  const textColorField = 'labelTextColor';

  // Function to update a specific preview
  function updatePreview(preview, bgColor, textColor) {
    preview.css({
      'background-color': bgColor,
      'color': textColor,
    });
  }

  // Function to add preview for a given color field
  function addPreview(field) {
    const input = html.find(`input[name="giggioz-better-labels.${field.key}"]`);
    const colorPicker = $(`<input type="color" value="${input.val()}">`);
    
    // Preview element
    const preview = $(`
      <div class="label-preview" style="
        margin-top: 5px; 
        padding: 5px; 
        border-radius: 3px; 
        text-align: center;
      ">
        ${field.label}
      </div>
    `);

    // Insert color picker and preview
    input.after(colorPicker);
    colorPicker.after(preview);
    input.hide();

    // Update preview on input change
    colorPicker.on('input', (event) => {
      const bgColor = event.target.value; // Get the new background color from the picker
      const textColor = html.find(`input[name="giggioz-better-labels.${textColorField}"]`).next('input[type="color"]').val();
      updatePreview(preview, bgColor, textColor); // Update the preview immediately
      input.val(bgColor).trigger('change'); // Update the hidden input and settings value
    });

    // Initial update for loaded values
    updatePreview(preview, input.val(), game.settings.get('giggioz-better-labels', textColorField));
  }

  // Add previews for all background color settings
  colorFields.forEach(addPreview);

  // Add color picker for Label Text Color
  const textInput = html.find(`input[name="giggioz-better-labels.${textColorField}"]`);
  const textColorPicker = $(`<input type="color" value="${textInput.val()}">`);
  
  textColorPicker.on('input', (event) => {
    const textColor = event.target.value;
    textInput.val(textColor).trigger('change');
    
    // Update all previews with the new text color
    colorFields.forEach(field => {
      const preview = html.find(`input[name="giggioz-better-labels.${field.key}"]`).nextAll('.label-preview');
      const bgColor = html.find(`input[name="giggioz-better-labels.${field.key}"]`).next('input[type="color"]').val();
      updatePreview(preview, bgColor, textColor);
    });
  });

  textInput.after(textColorPicker);
  textInput.hide();

  // Add Reset Button
  const resetButton = $(`<button type="button" style="margin-top: 10px;">Reset to Default</button>`);
  resetButton.on('click', () => {
    const defaults = {
      publicLabelColor: '#28a745',
      privateLabelColor: '#007bff',
      selfLabelColor: '#6f42c1',
      blindLabelColor: '#dc3545',
      labelTextColor: '#ffffff',
    };

    for (const [key, value] of Object.entries(defaults)) {
      game.settings.set('giggioz-better-labels', key, value);
    }

    // Update previews after reset
    colorFields.forEach(field => {
      const preview = html.find(`input[name="giggioz-better-labels.${field.key}"]`).nextAll('.label-preview');
      updatePreview(preview, defaults[field.key], defaults[textColorField]);
    });
    textColorPicker.val(defaults[textColorField]);
    ui.notifications.info("All label colors have been reset to default values.");
  });

  html.find(`.tab[data-tab="giggioz-better-labels"]`).append(resetButton);
});

Hooks.on('createChatMessage', async (chatMessage, options, userId) => {
  let visibility, backgroundColor;
  const textColor = game.settings.get('giggioz-better-labels', 'labelTextColor');
  const isGM = game.users.get(userId)?.isGM;

  if (chatMessage.blind) {
    visibility = 'Blind';
    backgroundColor = game.settings.get('giggioz-better-labels', 'blindLabelColor');
  } else if (chatMessage.whisper && chatMessage.whisper.length > 0) {
    if (chatMessage.whisper.length === 1 && chatMessage.whisper[0] === userId) {
      visibility = 'Self';
      backgroundColor = game.settings.get('giggioz-better-labels', 'selfLabelColor');
    } else {
      visibility = 'Private';
      backgroundColor = game.settings.get('giggioz-better-labels', 'privateLabelColor');
    }
    if (isGM) {
      visibility = 'Private/Self is Self for GMs';
      backgroundColor = game.settings.get('giggioz-better-labels', 'selfLabelColor');
    }
  } else {
    visibility = 'Public';
    backgroundColor = game.settings.get('giggioz-better-labels', 'publicLabelColor');
  }

  const style = `color: ${textColor}; background-color: ${backgroundColor}; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; margin-bottom: 5px;`;

  const label = `<p style="${style}">${visibility}</p>`;
  const newContent = label + chatMessage.content;

  await chatMessage.update({ content: newContent });
});
