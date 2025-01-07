import { Modules } from "../modules";

// Do Sig Scan?

export const Addrs = (function() {
    // 0x140000000 base
    return {
        Logger: {
            OutputDebugStringW : Modules.ED85.base.add(0x0B3EC0), // Covers less strings, more accurate as does not need printf.
            OutputDebugStringA : Modules.ED85.base.add(0x71FBD0), // Never called?

            // Ansi2UTF8 : Modules.ED85.base.add(0x0B3180),
            Ansi2UTF8 : Modules.ED85.base.add(0x0B3020),

            Output_Printf : Modules.ED85.base.add(0x71FC00),
        },
    };
})();