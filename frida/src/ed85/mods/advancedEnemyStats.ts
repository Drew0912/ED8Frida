import { ED85, BattleProc } from "../types"
import * as utils from "../../utils";


export function displayEnemyCPByName(pseudoChrId: number) {
    const enemyBattleChar = BattleProc.getBattleCharWorkForEnemyNumber(pseudoChrId);
    if (!enemyBattleChar) {
        utils.log("ED8Frida.advancedEnemyStats.displayEnemyCPByName() failed. Should not happen as fixed, enemyBattleChar undefined.")
        // utils.log(`BattleProc Address: ${ED85.battleProc.pointer.toString()}`);
        return;
    }

    if (enemyBattleChar.character.name.includes('-')) {
        const originalName = enemyBattleChar.character.name.slice(0, enemyBattleChar.character.name.indexOf('-'));
        enemyBattleChar.character.name = `${originalName}- CP:${enemyBattleChar.currentCP}`;
    }
    else {
        enemyBattleChar.character.name = `${enemyBattleChar.character.name} - CP:${enemyBattleChar.currentCP}`;
    }
}

// Crashes often.
export function replaceDescriptionWithEnemyStats(pseudoChrId: number) {
    const enemyBattleChar = BattleProc.getBattleCharWorkForEnemyNumber(pseudoChrId);
    if (!enemyBattleChar) {
        utils.log("ED8Frida.advancedEnemyStats.replaceDescriptionWithEnemyStats() failed. Should not happen as fixed, enemyBattleChar undefined.")
        // utils.log(`BattleProc Address: ${ED85.battleProc.pointer.toString()}`);
        return;
    }

    enemyBattleChar.description = `STR: ${enemyBattleChar.str}, DEF: ${enemyBattleChar.def}\nATS: ${enemyBattleChar.ats}, ADF: ${enemyBattleChar.adf}\nSPD: ${enemyBattleChar.spd}, MOV: ${enemyBattleChar.mov}\nEVA: ${enemyBattleChar.eva}`;
}