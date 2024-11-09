GiggiozBetterLabels.setupSettingsInterface = function (app, html, data) {
  if (app.constructor.name !== 'SettingsConfig') return;

  const colorFields = [
    { key: 'publicLabelColor', label: 'Public Message Example' },
    { key: 'privateLabelColor', label: 'Private Message Example' },
    { key: 'selfLabelColor', label: 'Self Message Example' },
    { key: 'blindLabelColor', label: 'Blind Message Example' },
  ];

  const textColorField = 'labelTextColor';

  function updatePreview(preview, bgColor, textColor) {
    preview.css({
      'background-color': bgColor,
      color: textColor,
    });
  }

  function addPreview(field) {
    const input = html.find(`input[name="giggioz-better-labels.${field.key}"]`);
    const colorPicker = $(`<input type="color" value="${input.val()}">`);

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

    input.after(colorPicker);
    colorPicker.after(preview);
    input.hide();

    colorPicker.on('input', (event) => {
      const bgColor = event.target.value;
      const textColor = html.find(`input[name="giggioz-better-labels.${textColorField}"]`).next('input[type="color"]').val();
      updatePreview(preview, bgColor, textColor);
      input.val(bgColor).trigger('change');
    });

    updatePreview(preview, input.val(), game.settings.get('giggioz-better-labels', textColorField));
  }

  colorFields.forEach(addPreview);

  const textInput = html.find(`input[name="giggioz-better-labels.${textColorField}"]`);
  const textColorPicker = $(`<input type="color" value="${textInput.val()}">`);

  textColorPicker.on('input', (event) => {
    const textColor = event.target.value;
    textInput.val(textColor).trigger('change');

    colorFields.forEach((field) => {
      const preview = html.find(`input[name="giggioz-better-labels.${field.key}"]`).nextAll('.label-preview');
      const bgColor = html.find(`input[name="giggioz-better-labels.${field.key}"]`).next('input[type="color"]').val();
      updatePreview(preview, bgColor, textColor);
    });
  });

  textInput.after(textColorPicker);
  textInput.hide();

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

  // Update both the previews and color pickers
  colorFields.forEach((field) => {
    const input = html.find(`input[name="giggioz-better-labels.${field.key}"]`);
    const colorPicker = input.next('input[type="color"]');
    const preview = colorPicker.next('.label-preview');

    input.val(defaults[field.key]).trigger('change');
    colorPicker.val(defaults[field.key]);
    updatePreview(preview, defaults[field.key], defaults[textColorField]);
  });

  // Update the text color picker separately
  textInput.val(defaults[textColorField]).trigger('change');
  textColorPicker.val(defaults[textColorField]);

  ui.notifications.info('All label colors have been reset to default values.');
});


  html.find(`.tab[data-tab="giggioz-better-labels"]`).append(resetButton);
}