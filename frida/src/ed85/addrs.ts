import { Modules } from "../modules";
import * as utils from "../utils";

// Do Sig Scan? Have to edit getGameVersion for version agnostic benefit.
// Add some option (config file) to set script to reverie independent of version.
let UseSigScan = false;

// Synchronous scan using input sig string.
function sigScan(sig: string) : NativePointer{
    const result = Memory.scanSync(Modules.ED85.base, Modules.ED85.size, sig);
    const res = JSON.parse(JSON.stringify(result[0])); // {"address":x, "size":y}
    utils.log(`${sig} found at: ${res.address}`);
    return ptr(res.address);
}

export const Addrs = (function() {
    // 0x140000000 base
    switch (utils.getGameVersion()) {
        case 'ed85_v115':
        default:
            return {
                Logger: {
                    OutputDebugStringW : Modules.ED85.base.add(0x0B3EC0), // Covers less strings, more accurate as does not need printf.
                    OutputDebugStringA : Modules.ED85.base.add(0x71FBD0), // Never called?
                    // Ansi2UTF8 : Modules.ED85.base.add(0x0B3180),
                    Ansi2UTF8 : Modules.ED85.base.add(0x0B3020),
                    Output_Printf : !UseSigScan ? Modules.ED85.base.add(0x71FC00) : sigScan('F7 C1 FD FF FF FF ?? ?? ?? ?? ?? ?? 48 89 54 24 10 4C 89 44 24 18 4C 89 4C 24 20 53 B8 60 40 00 00 ?? ?? ?? ?? ?? 48 2B E0'),
                },

                InfoString: {
                    TitleScreenVerStringData : Modules.ED85.base.add(0xC59B2C),
                    TitleScreenVerStringCode : Modules.ED85.base.add(0x654D16), // Instruction after lea rdx.
                    WindowTextString : Modules.ED85.base.add(0x0B7EAC), //Instruction after loading regs.
                },
            };
        case 'ed85_v114':
            return {
                Logger: {
                    OutputDebugStringW : Modules.ED85.base.add(0x0B3D90), // Covers less strings, more accurate as does not need printf.
                    OutputDebugStringA : Modules.ED85.base.add(0x727940), // Never called?
                    Ansi2UTF8 : Modules.ED85.base.add(0x0B2EF0),
                    Output_Printf : Modules.ED85.base.add(0x727970),
                },

                InfoString: {
                    TitleScreenVerStringData : Modules.ED85.base.add(0xC62890),
                    TitleScreenVerStringCode : Modules.ED85.base.add(0x65AF66), // Instruction after lea rdx.
                    WindowTextString : Modules.ED85.base.add(0x0B7C5C), //Instruction after loading regs.
                },
            };
    }
})();