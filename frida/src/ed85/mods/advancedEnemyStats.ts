import { ED85, BattleProc } from "../types"
import * as utils from "../../utils";


export function displayEnemyCPByName(pseudoChrId: number) {
    const enemyBattleChar = BattleProc.getBattleCharWorkForEnemyNumber(pseudoChrId);
    if (!enemyBattleChar) {
        utils.log("ED8Frida.advancedEnemyStats.displayEnemyCPByName(). Should not happen, enemyBattleChar undefined. Currently unknown why.")
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