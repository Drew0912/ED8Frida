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

                File: {
                    Open : Modules.ED85.base.add(0x088C70),
                    GetSize : Modules.ED85.base.add(0x089120),
                    DLCAssetIO : Modules.ED85.base.add(0x06DAA0),
                },

                ED85: {
                    SharedInstance : Modules.ED85.base.add(0xE7CFE0),
                    HandleActMenu : Modules.ED85.base.add(0x32B410),
                    PlayerSBreak : Modules.ED85.base.add(0x0DCF50),
                },

                Script: {
                    Load : Modules.ED85.base.add(0x59CA10),
                    Call : Modules.ED85.base.add(0x59CD20),
                    ScriptInterpreter : Modules.ED85.base.add(0x59DCA0),
                },

                ScriptManager: {
                    LoadLibraries : Modules.ED85.base.add(0x2CD130),
                    GetScriptByID : Modules.ED85.base.add(0x59BC20),
                    // InitScripts   : Modules.ED85.base.add(0x2CB5F0), //v1.0.8
                    // InitED8Script : Modules.ED85.base.add(0x10D410), //v1.0.8
                },

                AbnormalStatus: {
                    BossFlagCheck : Modules.ED85.base.add(0x1226E2),
                    SetTurnsToOne : Modules.ED85.base.add(0x12271A),

                    InsightEVAValue : Modules.ED85.base.add(0x12ECA2),
                    InsightACCValue : Modules.ED85.base.add(0x12EC97),
                    BlindEVAValue : Modules.ED85.base.add(0x12ECB7),
                    BlindACCValue : Modules.ED85.base.add(0x12ECAE),
                },

                BODurationDownOnEnemyTurn : Modules.ED85.base.add(0x0E1968),
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

                File: {
                    Open : Modules.ED85.base.add(0x088580),
                    GetSize : Modules.ED85.base.add(0x088A30),
                    DLCAssetIO : Modules.ED85.base.add(0x06D9A0),
                },

                ED85: {
                    SharedInstance : Modules.ED85.base.add(0xE87060),
                    HandleActMenu : Modules.ED85.base.add(0x32BDA0),
                    PlayerSBreak : Modules.ED85.base.add(0x0DC9C0),
                },

                Script: {
                    Load : Modules.ED85.base.add(0x5A2A90),
                    Call : Modules.ED85.base.add(0x5A2DA0),
                    ScriptInterpreter : Modules.ED85.base.add(0x5A3D30),
                },

                ScriptManager: {
                    LoadLibraries : Modules.ED85.base.add(0x2CD880),
                    GetScriptByID : Modules.ED85.base.add(0x5A1CA0),
                    // InitScripts   : Modules.ED85.base.add(0x2CB5F0), //v1.0.8
                    // InitED8Script : Modules.ED85.base.add(0x10D410), //v1.0.8
                },

                AbnormalStatus: {
                    BossFlagCheck : Modules.ED85.base.add(0x122BC2),
                    SetTurnsToOne : Modules.ED85.base.add(0x122BFA),

                    InsightEVAValue : Modules.ED85.base.add(0x12F592),
                    InsightACCValue : Modules.ED85.base.add(0x12F587),
                    BlindEVAValue : Modules.ED85.base.add(0x12F5A7),
                    BlindACCValue : Modules.ED85.base.add(0x12F59E),
                },

                BODurationDownOnEnemyTurn : Modules.ED85.base.add(0x0E1488),
            };
    }
})();

export const Offsets = (function() {
    return {
        ED85 : {
            ScriptManager : 0x1DA8,
        },

        ScriptManager : {
            ThreadContext : 0x190B8,
            SizeOfThreadContext : 0x870,
            
            BattleProc : 0x6CB70,

            Scripts: { //param_1 + Offset
                btlcom : 0x3B8D0,
                face : 0x21730,
                common : 0x24948,
                btlsys : 0x311A8,
                btlwin : 0x34C30,
                infsys : 0x386B8,
                system2 : 0x27B60,
                system3 : 0x2AD78,
                system4 : 0x2DF90,
                sound : 0x3F358,
                sound2 : 0x42570,
                tk_common : 0x45788,
                title00 : 0x1E518,
                debug : 0x21730, // Merge face.dat and debug.dat
            },
        },

        BattleProc : {
            allBattleCharWork : 0x100,
            onlyPlayerBattleCharWork : 0x110,

            SBreakParam1 : 0x8188,
        },

        BattleCharacter : {
            Flags : 0x420,
        },
    };
})();