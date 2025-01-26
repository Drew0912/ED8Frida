import * as utils from "../utils";
import { API } from "../modules";
import { ED85 } from "./types";

// Imported mods.
import { outputDebugInfo } from "./mods/logger";
import { addToWindowText, changeTitleVerString } from "./mods/changeInfoString";
import { fileRedirection } from "./mods/fileRedirection";
import { hookActMenu, loadDebug } from "./mods/debugScript";
import { hookScriptExtender, setTracing } from "./mods/scriptExtender";
import { abnormalStatusLimitWithBossFlagSub1, disableAbnormalStatusLimitWithBossFlag } from "./mods/abnormalStatusBossFlag";

function test() {
    
}

export function main() {
    loadDebug();
    const patchDirs = [
        'Higher/',
        'Drew0912/',
        'mod/',
        'patch/',
        'data/',
    ];
    utils.setPatchDirs(patchDirs)
    // Config stuff
    // if (ED85.getConfig().isSetPatchDirs) {
    //     const dirs = ED85.getConfig().patchDirs;
    //     if (dirs)
    //         utils.setPatchDirs(dirs);
    // }

    // Add setting UseSigScan here. Race condition with FridaLoader very possible with exe code being executed before frida.

    if (ED85.getConfig().isFileRedirection)
        fileRedirection();
    // if (ED85.getConfig().isLoadDebug)
    //     loadDebug();

    if (ED85.getConfig().isOpenCommandPrompt)
        API.WIN32.AllocConsole();
    outputDebugInfo(ED85.getConfig().isOutputDebugInfo);
    if (ED85.getConfig().isOpcodeTracing)
        setTracing(ED85.getConfig().isOpcodeTracing);

    if (ED85.getConfig().isHookActMenu[0])
        hookActMenu(ED85.getConfig().isHookActMenu[1]);
    if (ED85.getConfig().isChangeTitleVerString[0])
        changeTitleVerString(ED85.getConfig().isChangeTitleVerString[1], ED85.getConfig().isChangeTitleVerString[2]);
    if (ED85.getConfig().isAddToWindowText)
        addToWindowText();
    hookScriptExtender();

    if (ED85.getConfig().isDisableAbnormalStatusLimitWithBossFlag)
        disableAbnormalStatusLimitWithBossFlag();
    if (ED85.getConfig().isAbnormalStatusLimitWithBossFlagSub1)
        abnormalStatusLimitWithBossFlagSub1();

    utils.log("Reverie Frida script loaded.");

    // test();

}