import { hookLoggerPrintf, hookLoggerPrintfOutputFormatOnly } from "./mods/logger";

export function main() {
    (new NativeFunction(Process.getModuleByName('KERNEL32.DLL').getExportByName('AllocConsole'), "bool", [], 'win64'))();

    hookLoggerPrintf();

}