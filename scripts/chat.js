GiggiozBetterLabels.handleChatMessage = async function (chatMessage, options, userId) {
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
}

// module.exports = { handleChatMessage };
