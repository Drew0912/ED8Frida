import * as utils from "../utils";

import { hookLoggerPrintf, hookLoggerPrintfOutputFormatOnly } from "./mods/logger";
import { addToWindowText, changeTitleVerString } from "./mods/changeInfoString";
import { fileRedirection } from "./mods/fileRedirection";
import { hookActMenu, loadDebug } from "./mods/debugScript";
import { ED85 } from "./types";

function test() {
    
}

export function main() {
    // Config stuff
    const dirs = ED85.getConfig()?.patchDirs;
    if (dirs)
        utils.setPatchDirs(dirs);

    (new NativeFunction(Process.getModuleByName('KERNEL32.DLL').getExportByName('AllocConsole'), "bool", [], 'win64'))();
    utils.log("Reverie Frida script loaded.");
    // Add setting UseSigScan here.

    fileRedirection();
    loadDebug();
    hookActMenu();
    hookLoggerPrintf();
    changeTitleVerString();
    addToWindowText();
    // test();

}