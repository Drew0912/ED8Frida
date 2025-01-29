import { Addrs } from "../addrs";

export function braveOrderDownOnEnemy() {
    Memory.patchCode(Addrs.BODurationDownOnEnemyTurn, 1, (code) => {
        code.writeU8(0x75); //Patch so BO goes down on player and enemy turns. JZ to JNZ
    })
    // Check may be if BattleProc.onlyPlayerBattleCharWork.add(chrNumber*8) == ED85.battleProc.SBreakParam1.add(0x358)
    // SBreakParam1 may be pointer to battle instance?
}