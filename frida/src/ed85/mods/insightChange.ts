import { Addrs } from "../addrs";

export function patchInsightEVA(value: number) {
    Memory.patchCode(Addrs.AbnormalStatus.InsightEVAValue, 1, (code) => {
        code.writeS8(value);
    })
}

export function patchInsightACC(value: number) {
    Memory.patchCode(Addrs.AbnormalStatus.InsightACCValue, 1, (code) => {
        code.writeS8(value);
    })
}


// Blind has negative values.
export function patchBlindEVA(value: number) {
    Memory.patchCode(Addrs.AbnormalStatus.BlindEVAValue, 1, (code) => {
        code.writeS8(-value);
    })
}

export function patchBlindACC(value: number) {
    Memory.patchCode(Addrs.AbnormalStatus.BlindACCValue, 1, (code) => {
        code.writeS8(-value);
    })
}