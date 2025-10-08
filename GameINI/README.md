# Game.ini Generator

A web-based configuration generator for Path of Titans Game.ini files.

## Features

- **Smart change detection**: Only modified settings are included in the output
- **Visual change indicators**: Modified fields are highlighted with a checkmark (✓) and pink glow
- **Change counter**: See how many settings you've modified at a glance
- **Organized sections**: Settings grouped by category (General, Quest System, Nesting, etc.)
- **Multi-line support**: Special handling for character/critter lists
- **Search functionality**: Quick filtering of settings
- **Live preview**: See changes in real-time
- **Export options**: Copy to clipboard or download as file

## Special Fields

### AllowedCharacters / DisallowedCharacters

These fields accept one dinosaur name per line. Each entry will be generated as a separate line in the INI:

**Input:**
```
Allosaurus
Ceratosaurus
```

**Output:**
```
AllowedCharacter=Allosaurus
AllowedCharacter=Ceratosaurus
```

### AllowedCritters / DisallowedCritters

Same behavior as character lists - one critter per line, each generates a separate INI line.

## Usage

1. Open `game-ini-generator.html` in a web browser
2. Modify any settings you want to change from defaults
3. Click "Generate Game.ini" to see the preview
4. Use "Copy to Clipboard" or "Download Game.ini" to export
5. Place the generated Game.ini in your server's config folder

## Files

- `game-ini-generator.html` - Main interface
- `game-ini-generator.js` - Logic and form generation
- `Defaults.ini` - Default values for all settings
- `descriptions.md` - Descriptions for each setting
