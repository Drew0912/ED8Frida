# ED8 Frida
Refer to [READMEOuroboros.md](READMEOuroboros.md) for original information, not in English.

## Supported games
- Trails of Cold Steel 3 Chinese Version
    - Refer to [READMEOuroboros.md](READMEOuroboros.md)
- Trails of Cold Steel 4 Japanese Version (NISA 1.2) (Not Latest)
    - Refer to [READMEOuroboros.md](READMEOuroboros.md)
- Trails into Reverie (NISA V1.1.5) (Latest)
    - V1.1.4 (for GOG release) is also supported but not tested so may not work.

Note that only Windows 10 has been tested. Frida has had some issues with Windows 10.

## Features
- Outputs debug information from the game to a command prompt.
    - Note that not all information is complete due to having to writing a quick implementation of `printf` that does not support all string formats.
    - ![ConsoleOutput.png](imgs/ConsoleOutput.png)
- Modifies info strings to indicate that ED8Frida is running along with support for custom strings.
    - Includes version number on title screen. Does work along side Senpatcher.
    - Adds Frida Enabled to the window title name.
- File Redirection for modified files.
    - Recommend you use Senpatcher over this to do mod loading.
- Adds support for `debug.dat` and calling `debug.dat` and a custom debug menu.
    - Debug menu can be called from overworld where the ARCUS act menu can be used. Press `shift` and the button to open the ARCUS act menu (default key R).
    - To avoid conflicts loading/finding `debug.dat`, `debug.dat` can be either in its default location `data/scripts/scena/dat_en/debug.dat` (lower priority) or in the directory with `hnk.exe` or `bin/Win64/debug.dat` (higher priority).
    - ![DebugMenu.png](imgs/DebugMenu.png)May not be latest debug menu.
