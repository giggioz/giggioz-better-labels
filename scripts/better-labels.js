Hooks.on("createChatMessage", async (chatMessage, options, userId) => {
    let visibility, color;
    const isGM = game.users.get(userId)?.isGM;
  
    if (chatMessage.blind) {
      visibility = "Blind";
      color = "hsl(0, 70%, 50%)";
    } else if (chatMessage.whisper && chatMessage.whisper.length > 0) {
      if (chatMessage.whisper.length === 1 && chatMessage.whisper[0] === userId) {
        visibility = "Self";
        color = "hsl(300, 70%, 50%)";
      } else {
        visibility = "Private";
        color = "hsl(250, 70%, 50%)";
      }
      // Self and private for the Master are the same thing!
      if (isGM) {
        visibility = "Private/Self is Self for GMs";
        color = "hsl(300, 70%, 50%)";
      }
    } else {
      visibility = "Public";
      color = "hsl(120, 70%, 50%)";
    }
  
    const style = `color: white; background-color: ${color}; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; margin-bottom: 5px;`;
  
    const label = `<p style="${style}">${visibility}</p>`;
    const newContent = label + chatMessage.content;
  
    await chatMessage.update({ content: newContent });
  });
  