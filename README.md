# Giggioz Better Labels

**Giggioz Better Labels** is a Foundry VTT module that enhances chat message visibility by dynamically labeling messages based on their privacy settings.

## Features

1. **Chat Message Visibility Labels**:
   - **Public**: Green label for messages visible to all.
   - **Private**: Blue label for messages whispered to specific users.
   - **Self**: Purple label for messages whispered to oneself.
   - **Blind**: Red label for messages marked as blind.
   - **GM-Specific Behavior**: Messages whispered to the GM show as "Private/Self is Self for GMs."

## Installation

1. Download or clone this repository.
2. Place the module folder in your Foundry VTT `modules` directory:
   - `~/FoundryVTT/Data/modules` (or equivalent on your system).
3. Enable the module in your game by going to **Game Settings** > **Manage Modules** and checking **Giggioz Better Labels**.

## Usage

### Chat Labels

- Labels are automatically added to chat messages based on their visibility:
  - **Public**: Messages visible to everyone.
  - **Private**: Messages whispered to one or more users.
  - **Self**: Messages whispered to oneself.
  - **Blind**: Messages marked as blind and hidden from players.
- The GM-specific label behavior differentiates between messages meant for private viewing by the GM.

## Development

To develop in local enviroment run ./create-symlink.sh to create a copy of this repo into  foundry modules. Chek the file to setup your path.

## Contributing

Feel free to submit issues or pull requests if you have improvements or bug fixes.

## Buy Me a Coffee

If you find this module useful and want to support its development, consider buying me a coffee! ☕

[![Buy Me a Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/giggioz)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
