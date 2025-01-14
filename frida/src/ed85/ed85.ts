import * as utils from "../utils";

import { hookLoggerPrintf, hookLoggerPrintfOutputFormatOnly } from "./mods/logger";
import { addToWindowText, changeTitleVerString } from "./mods/changeInfoString";
import { FileRedirection } from "./mods/FileRedirection";
import { hookActMenu, loadDebug } from "./mods/debugScript";

function test() {
    
}

export function main() {
    (new NativeFunction(Process.getModuleByName('KERNEL32.DLL').getExportByName('AllocConsole'), "bool", [], 'win64'))();
    utils.log("Reverie Frida script loaded.");
    // Add setting UseSigScan here.

    FileRedirection();
    loadDebug();
    hookActMenu();
    hookLoggerPrintf();
    changeTitleVerString();
    addToWindowText();
    // test();

}