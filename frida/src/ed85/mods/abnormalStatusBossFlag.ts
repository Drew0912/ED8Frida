import { Addrs } from "../addrs";

//param_2 for this function is BattleCharacter

export function disableAbnormalStatusLimitWithBossFlag(){
    Memory.patchCode(Addrs.AbnormalStatus.BossFlagCheck, 1, (code) => {
        code.writeU8(0xEB); //Replace JZ with JMP (param_2 + 0x420 is mons flags)
    });
}

export function abnormalStatusLimitWithBossFlagSub1(){
    Memory.patchCode(Addrs.AbnormalStatus.SetTurnsToOne, 8,(code) => {
        code.writeU8(0x83); //SUB EDI,0x1 0x83EF019090909090
        code.add(1).writeU8(0xEF);
        code.add(2).writeU8(0x01);
        code.add(3).writeU8(0x90);
        code.add(4).writeU32(0x90909090)
    });
}