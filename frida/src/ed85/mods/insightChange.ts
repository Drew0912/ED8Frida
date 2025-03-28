import { Addrs } from "../addrs";
import * as utils from "../../utils";

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

// Hooks into function that adds EVA (on taking a hit) to char EVA if they have insight
export function limitEVA(value: number) {
    // Before checks for EVA added for Insight. Maybe use X86Writer instead?
    // ptr(0x14012EC9B) (v1.1.5)
    Interceptor.attach(Addrs.AbnormalStatus.LimitEVAInstruction, function() {
        const ctx = (this.context as X64CpuContext);
        if (ctx.rdi.toUInt32() > value) {
            // utils.log(`EVA Value before: ${ctx.rdi.toUInt32().toString()}`);
            ctx.rdi = ptr(value);
            // utils.log(`EVA Value after: ${ctx.rdi.toUInt32().toString()}`);
        }
    });
}