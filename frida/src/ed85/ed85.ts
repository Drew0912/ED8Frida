import * as utils from "../utils";
import { API } from "../modules";

// Imported mods.
import { outputDebugInfo } from "./mods/logger";
import { addToWindowText, changeTitleVerString } from "./mods/changeInfoString";
import { fileRedirection } from "./mods/fileRedirection";
import { hookActMenu, loadDebug } from "./mods/debugScript";
import { ED85 } from "./types";

function test() {
    
}

export function main() {
    // Config stuff
    if (ED85.getConfig().isSetPatchDirs) {
        const dirs = ED85.getConfig().patchDirs;
        if (dirs)
            utils.setPatchDirs(dirs);
    }

    if (ED85.getConfig().isOpenCommandPrompt)
        API.WIN32.AllocConsole();
    utils.log("Reverie Frida script loaded.");
    // Add setting UseSigScan here.

    if (ED85.getConfig().isFileRedirection)
        fileRedirection();
    if (ED85.getConfig().isLoadDebug)
        loadDebug();
    if (ED85.getConfig().isHookActMenu)
        hookActMenu();
    outputDebugInfo(ED85.getConfig().isOutputDebugInfo);
    if (ED85.getConfig().isChangeTitleVerString[0])
        changeTitleVerString(ED85.getConfig().isChangeTitleVerString[1], ED85.getConfig().isChangeTitleVerString[2]);
    if (ED85.getConfig().isAddToWindowText)
        addToWindowText();
    // test();

}