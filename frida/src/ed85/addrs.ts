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

                VFTable: {
                    BattleCharWork : Modules.ED85.base.add(0xC20260),
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

                VFTable: {
                    BattleCharWork : Modules.ED85.base.add(0xC290C0),
                },
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
            // Maybe something
            FieldMapMaybe : 0x28,
            BattleViewMaybe : 0x50,
            BattleTableMaybe : 0x60,

            PartOfTurnCounter: 0x68, // BattleResultManager
            allBattleCharWork : 0x100,
            onlyPlayerBattleCharWork : 0x110,

            BattleScriptName : 0x31C,

            SBreakParam1 : 0x8188,
        },

        BattleCharacter : { // BattleCharWork
            BattleProc : 0x10,
            Character : 0x18, // CharWork

            // t_mons.tbl
            AlgoFileName : 0x20,
            ModelName : 0x28,
            AniName : 0x30,
            ModelScale : 0x38,
            CameraPivotHeight : 0x3C,

            float1 : 0x40,
            float2 : 0x44,
            float3 : 0x48,
            float4 : 0x4C,
            float5 : 0x50,
            short6 : 0x54,
            short7 : 0x56,

            HPBase : 0x58,
            HPMultiplier : 0x5C,
            EPMax : 0x60,
            EPInit : 0x62,
            CPMax : 0x64,
            CPInit : 0x66,
            STRBase : 0x68,
            STRMultiplier : 0x6C,
            DEFBase : 0x70,
            DEFMultiplier : 0x74,
            ATSBase: 0x78,
            ATSMultiplier : 0x7C,
            ADFBase : 0x80,
            ADFMultiplier : 0x84,
            DEXBase : 0x88,
            DEXMultiplier : 0x8C,
            AGLBase : 0x90,
            AGLMultiplier : 0x94,
            EVABase : 0x98,
            SPDBase : 0x9A,
            SPDMultiplier: 0x9C,
            MOVBase : 0xA0,
            MOVMultiplier : 0xA4,
            EXPBase : 0xA8,
            EXPMultiplier : 0xAC,
            BreakBase : 0xB0,
            BreakMultiplier : 0xB4,

            Name : 0xC8, // Pointer to string. Cannot be dynamically edited.
            Description : 0xD0,

            // From t_mons.tbl, can be changed?
            PoisonEfficacy : 0xD8,
            SealEfficacy : 0xD9,
            MuteEfficacy : 0xDA,
            BlindEfficacy : 0xDB,
            SleepEfficacy : 0xDC,
            BurnEfficacy : 0xDD,
            FreezeEfficacy : 0xDE,
            PetrifyEfficacy : 0xDF,
            FaintEfficacy : 0xF0,
            ConfuseEfficacy : 0xE1,
            CharmEfficacy : 0xE2,
            DeathblowEfficacy : 0xE3,
            NightmareEfficacy : 0xE4,
            DelayEfficacy : 0xE5,
            VanishEfficacy : 0xE6,
            StatDownEfficacy : 0xE7,

            SlashEfficacy : 0xE8,
            ThrustEfficacy : 0xEA,
            PierceEfficacy : 0xEC,
            StrikeEfficacy : 0xEE,

            EarthEfficacy : 0xF0,
            WaterEfficacy : 0xF1,
            FireEfficacy : 0xF2,
            WindEfficacy : 0xF3,
            TimeEfficacy : 0xF4,
            SpaceEfficacy : 0xF5,
            MirageEfficacy : 0xF6,

            // Cannot be changed.
            SepithEarth : 0xF7,
            SepithWater : 0xF8,
            SepithFire : 0xF9,
            SepithWind : 0xFA,
            SepithTime : 0xFB,
            SepithSpace : 0xFC,
            SepithMirage : 0xFD,
            SepithMass : 0xFE,

            // Need to check these
            SepithEarthMultiplier : 0x100,
            SepithWaterMultiplier : 0x104,
            SepithFireMultiplier : 0x108,
            SepithWindMultiplier : 0x10C,
            SepithTimeMultiplier : 0x110,
            SepithSpaceMultiplier : 0x114,
            SepithMirageMultiplier : 0x118,
            SepithMassMultiplier : 0x11C,

            DropItemId1 : 0x122,
            DropItemId2 : 0x124,

            // floats, need to check these.
            StatVarMin : 0x130,
            StatVarMax : 0x134,

            EXPValue : 0x164, // Can change.

            // Can be changed.
            EarthSepith : 0x16E,
            WaterSepith : 0x170,
            FireSepith : 0x172,
            WindSepith : 0x174,
            TimeSepith : 0x176,
            SpaceSepith : 0x178,
            MirageSepith : 0x17A,
            MassSepith : 0x17C,


            // Test below, can change these.
            Flags : 0x420,

            CurrentHP : 0x424,
            MaxHP : 0x428,
            CurrentEP : 0x42A,
            MaxEP : 0x42C,
            CurrentCP : 0x430,
            MaxCP : 0x432,

            STR : 0x434,
            DEF : 0x438,
            ATS : 0x43C,
            ADF : 0x440,
            SPD : 0x448,
            MOV : 0x44A,

            CurrentBreak : 0x454,
            MaxBreak : 0x458,

            AGL : 0x45E,
            EVA : 0x45F,

            EXP : 0x460,
            LVL : 0x464,
            SomethingLikeLvl : 0x468,

            SomeChrIdMaybe : 0x50A,
        },

        Character : {
            Name : 0x860, // Can edit dynamically.
        }
    };
})();