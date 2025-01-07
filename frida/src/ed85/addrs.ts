import { Modules } from "../modules";

// Do Sig Scan?

export const Addrs = (function() {
    // 0x140000000 base
    return {
        Logger_Output_Printf : Modules.ED85.base.add(0x71FC00),
    };
})();