import * as json5 from "json5"
import * as path from "path"
import { Modules } from "../modules";
import { Addrs, Offsets} from "./addrs";
import { ED8BaseObject, isPathExists} from "../utils";
import * as utils from "../utils";


export enum ScriptId {
    Map                 = 0x00,
    System              = 0x0A,
    Current             = 0x0B,
    BtlSys              = 0x0C,
    InfSys              = 0x0E,
    Common              = 0x0F,
    CurrentCharacter    = 0x10,
    BtlMagic            = 0x11,
    BtlWin              = 0x12,
    BtlCom              = 0x13, //19
    Debug               = 0x14,
    Sound               = 0x15,
    TalkCommon          = 0x16,
    System2             = 0x17,
    System3             = 0x18,
    System4             = 0x19,
    BtlItem             = 0x1A,
    Sound2              = 0x1B,
    BtlScript           = 0x1C,
}

interface IConfig {
    isFileRedirection : boolean,
    patchDirs : string[],
    isSetPatchDirs : boolean,
    isOpenCommandPrompt : boolean,
    isLoadDebug : boolean,
    isHookActMenu : [boolean, string]
    isOutputDebugInfo : number,
    isChangeTitleVerString : [boolean, string, boolean],
    isAddToWindowText : boolean,
    isOpcodeTracing: boolean,
    isDisableAbnormalStatusLimitWithBossFlag: boolean,
    isAbnormalStatusLimitWithBossFlagSub1: boolean,
    patchInsightEVA : [boolean, number],
    patchInsightACC : [boolean, number],
    patchBlindEVA : [boolean, number],
    patchBlindACC : [boolean, number],
    isBODurationDownOnEnemyTurn : boolean,
}
let defaultConfig: IConfig = {
    isFileRedirection : false,
    patchDirs : ['data/'],
    isSetPatchDirs : false,
    isOpenCommandPrompt: false,
    isLoadDebug : true,
    isHookActMenu : [false, 'FC_ActMenu_MOD'],
    isOutputDebugInfo : 0,
    isChangeTitleVerString : [true, 'ED8Frida - No config file found', true],
    isAddToWindowText : true,
    isOpcodeTracing : false,
    isDisableAbnormalStatusLimitWithBossFlag: false,
    isAbnormalStatusLimitWithBossFlagSub1: false,
    patchInsightEVA : [false, 50],
    patchInsightACC : [false, 50],
    patchBlindEVA : [false, 50],
    patchBlindACC : [false, 50],
    isBODurationDownOnEnemyTurn : false,
}

export class Script extends ED8BaseObject {
    private static _Load = new NativeFunction(Addrs.Script.Load, "pointer", ['pointer', 'pointer', 'uint32', 'bool'], 'win64');
    private static _Call = new NativeFunction(Addrs.Script.Call, "bool", ['pointer', 'pointer', 'pointer', 'uint32', 'uint8'], 'win64');

    load(path: string, type: number, debugLog: boolean = false): NativePointer {
        const p = Memory.allocUtf8String(path);
        return Script._Load(this.pointer, p, type, Number(debugLog));
    }

    loadDebug(): NativePointer {
        const path = 'bin/Win64/debug.dat'
        if (isPathExists(path)){
            return this.load(path, 0xFFFFFFFF, false);
        }
        const defaultPath = 'data/scripts/scena/dat_en/debug.dat';
        return this.load(defaultPath, 0xFFFFFFFF, false);
    }

    call(context: NativePointer, func: string, arg3: number, arg4: number): boolean {
        const f = Memory.allocUtf8String(func);
        return !!Script._Call(this.pointer, context, f, arg3, arg4);
    }
}

export class ScriptManager extends ED8BaseObject {
    private static _getScriptByID = new NativeFunction(Addrs.ScriptManager.GetScriptByID, "pointer", ['pointer', 'pointer', 'uint16'], 'win64');

    static getScriptByID(id: ScriptId): Script | undefined {
        const scr = ScriptManager._getScriptByID(ED85.scriptManager.getThreadContext(), ED85.scriptManager.getThreadContext(), id);
        return scr.isNull() ? undefined : new Script(scr);
    }

    getThreadContext(threadId = 0): NativePointer {
        return this.pointer.add(Offsets.ScriptManager.ThreadContext + threadId * Offsets.ScriptManager.SizeOfThreadContext);
    }

    get common(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.common));
    }

    get system2(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.system2));
    }

    get system3(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.system3));
    }

    get system4(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.system4));
    }

    get btlsys(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.btlsys));
    }

    get btlwin(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.btlwin));
    }

    get debug(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.debug));
    }

    get btlcom(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.btlcom));
    }

    get sound(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.sound));
    }

    get tk_common(): Script {
        return new Script(this.pointer.add(Offsets.ScriptManager.Scripts.tk_common));
    }

    get battleProc(): BattleProc {
        return new BattleProc(this.readPointer(Offsets.ScriptManager.BattleProc));
    }
}

export class ED85 extends ED8BaseObject {
    private static _sharedInstance: ED85;
    private static _config: IConfig;

    private static _SBreak = new NativeFunction(Addrs.ED85.PlayerSBreak, 'uint16', ['pointer', 'pointer', 'bool', 'uint32', 'uint16']);

    static get sharedInstance(): ED85 {
        if (this._sharedInstance)
            return this._sharedInstance;

        const p = Addrs.ED85.SharedInstance.readPointer();

        if (p.isNull()) {
            throw new Error('ED85 null');
        }

        this._sharedInstance = new ED85(p);
        return this._sharedInstance;
    }

    static get scriptManager(): ScriptManager {
        return new ScriptManager(this.sharedInstance.readPointer(Offsets.ED85.ScriptManager));
    }

    static getConfig(): IConfig {
        if (this._config)
            return this._config;

        this._config = function() {
            const exePath = path.join(path.dirname(path.dirname(path.dirname(Modules.ED85.path.split('\\').join('/')))), 'bin', 'Win64', 'config_ED8Frida.json5');
            // utils.log('config file location: %s', exePath);
            const config = utils.readFileContent(exePath);
            if (!config)
                return defaultConfig;

            const s = Buffer.from(config).toString('utf8');

            try {
                const cfg: IConfig = json5.parse(s);
                return cfg;
            } catch (e) {
                utils.log('load config: %s', e);
            }

            return defaultConfig;
        }();

        return this._config;
    }

    static get battleProc(): BattleProc {
        return this.scriptManager.battleProc;
    }
    
    static SBreak(pseudoChrId: number) {
        const battleCharWork = function() {
            if (pseudoChrId >= 0xF043 && pseudoChrId <= 0xF04A) {
                const res = BattleProc.getBattleCharWorkForEnemyNumber(pseudoChrId);
                return res;
            }
            // This does not work for player pseudoChrId as it does not automatically use S-Craft.
            // else if (pseudoChrId >= 0xF020 && pseudoChrId <= 0xF027) {
            //     // const res = BattleProc.getBattleCharWorkForEnemyNumber(pseudoChrId);
            //     // return res;
            // }
        }();

        if (battleCharWork) {
            ED85._SBreak(ED85.battleProc.SBreakParam1, battleCharWork.pointer, 1, 0, 0);
        }
    }
}

export class BattleProc extends ED8BaseObject {
    get allBattleCharWork(): NativePointer {
        return this.readPointer(Offsets.BattleProc.allBattleCharWork);
    } 

    // Mostly same as above but no pointers for enemy BattleCharacter.
    get onlyPlayerBattleCharWork(): NativePointer {
        return this.readPointer(Offsets.BattleProc.onlyPlayerBattleCharWork);
    }

    // Gets pointer for the first parameter used in ED85.playerSBreakFunction. May be useful for other things.
    // ED85.battleProc.SBreakParam1.add(0x358) (braveOrderDurationDownOnEnemyTurn)
    // Offsets.BattleProc.SBreakParam1 == 0x8188
    get SBreakParam1(): NativePointer {
        return this.readPointer(Offsets.BattleProc.SBreakParam1);
    }

    static getBattleCharWorkForEnemyNumber(pseudoChrId: number): BattleCharacter | undefined {
        let value = -1;
        // Getting BattleCharacter index of last present party member.
        for (let i = 0; i < 8; i++) {
            // 0x100 contains all BattleCharWork, 0x110 contains only player BattleCharWork
            const BattleCharWork100 = ED85.battleProc.allBattleCharWork.add(i*8).readPointer();
            const BattleCharWork110 = ED85.battleProc.onlyPlayerBattleCharWork.add(i*8).readPointer();
            if (!BattleCharWork100.equals(BattleCharWork110)) {
                value = i;
                break
            }
        }
        if (value == -1) { return undefined } // No party members? Not possible.
        // utils.log("getBattleCharWorkForEnemyNumber: Should be number of party members: %s", value);

        // Checks if the found BattleCharacter actually is a BattleCharacter struct.
        // Should only not clear if SBreaking for an enemy PseudoChrId not present in battle.
        const SBreakSelf = new BattleCharacter(ED85.battleProc.allBattleCharWork.add((value+pseudoChrId-0xF043)*8).readPointer());
        if (SBreakSelf.isValid()) {
            return SBreakSelf;
        }
        return undefined;
        
    }

    get braveOrderDurationCount(): number {
        return this.readPointer(0x8268).add(0x44).readU8();
    }

    set braveOrderDurationCount(value: number) {
        this.readPointer(0x8268).add(0x44).writeU8(value);
    }

    get braveOrderDurationCountDisplayOnly(): number {
        return this.readPointer(0x8268).add(0x45).readU8();
    }

    set braveOrderDurationCountDisplayOnly(value: number) {
        this.readPointer(0x8268).add(0x45).writeU8(value);
    }

    // Not tested
    get battleScriptName(): string {
        return this.readPointer(Offsets.BattleProc.BattleScriptName).readAnsiString()!;
    }

    // This value is used for action count in RP condition fights,
    // (Expr.Eval, 'BattleCmd(0x5C, 0x00)') gets this number
    // Offset 0x68
    get numberOfTurnsPassedInBattle(): number {
        return this.readPointer(Offsets.BattleProc.PartOfTurnCounter).add(0x39C).readU32();
    }

    set numberOfTurnsPassedInBattle(value: number) {
        this.readPointer(Offsets.BattleProc.PartOfTurnCounter).add(0x39C).writeU32(value);
    }
}

export class BattleCharacter extends ED8BaseObject {
    isValid(): boolean {
        return this.readPointer(0).equals(Addrs.VFTable.BattleCharWork);
    }

    // Should not be needed as there is a static way to get.
    get battleProc(): BattleProc {
        return new BattleProc(this.readPointer(Offsets.BattleCharacter.BattleProc));
    }

    get character(): Character {
        return new Character(this.readPointer(Offsets.BattleCharacter.Character));
    }

    // Values that can be edited live in battle.
    get currentHP(): number {
        return this.readU32(Offsets.BattleCharacter.CurrentHP);
    }

    set currentHP(value: number) {
        this.writeU32(Offsets.BattleCharacter.CurrentHP, value);
    }

    get currentCP(): number {
        return this.readU16(Offsets.BattleCharacter.CurrentCP);
    }

    set currentCP(value: number) {
        this.writeU16(Offsets.BattleCharacter.CurrentCP, value);
    }

    get poisonEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.PoisonEfficacy);
    }

    set poisonEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.PoisonEfficacy, value);
    }

    get sealEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.SealEfficacy);
    }

    set sealEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.SealEfficacy, value);
    }

    get muteEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.MuteEfficacy);
    }

    set muteEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.MuteEfficacy, value);
    }

    get blindEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.BlindEfficacy);
    }

    set blindEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.BlindEfficacy, value);
    }

    get sleepEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.SleepEfficacy);
    }

    set sleepEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.SleepEfficacy, value);
    }

    get burnEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.BurnEfficacy);
    }

    set burnEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.BurnEfficacy, value);
    }

    get freezeEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.FreezeEfficacy);
    }

    set freezeEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.FreezeEfficacy, value);
    }

    get petrifyEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.PetrifyEfficacy);
    }

    set petrifyEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.PetrifyEfficacy, value);
    }

    get faintEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.FaintEfficacy);
    }

    set faintEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.FaintEfficacy, value);
    }

    get confuseEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.ConfuseEfficacy);
    }

    set confuseEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.ConfuseEfficacy, value);
    }

    get charmEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.CharmEfficacy);
    }

    set charmEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.CharmEfficacy, value);
    }

    get deathblowEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.DeathblowEfficacy);
    }

    set deathblowEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.DeathblowEfficacy, value);
    }

    get nightmareEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.NightmareEfficacy);
    }

    set nightmareEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.NightmareEfficacy, value);
    }

    get delayEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.DelayEfficacy);
    }

    set delayEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.DelayEfficacy, value);
    }

    get vanishEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.VanishEfficacy);
    }

    set vanishEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.VanishEfficacy, value);
    }

    get statDownEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.StatDownEfficacy);
    }

    set statDownEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.StatDownEfficacy, value);
    }

    get slashEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.SlashEfficacy);
    }

    set slashEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.SlashEfficacy, value);
    }

    get thurstEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.ThrustEfficacy);
    }

    set thurstEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.ThrustEfficacy, value);
    }

    get pierceEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.PierceEfficacy);
    }

    set pierceEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.PierceEfficacy, value);
    }

    get strikeEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.StrikeEfficacy);
    }

    set strikeEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.StrikeEfficacy, value);
    }

    get earthEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.EarthEfficacy);
    }

    set earthEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.EarthEfficacy, value);
    }

    get waterEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.WaterEfficacy);
    }

    set waterEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.WaterEfficacy, value);
    }

    get fireEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.FireEfficacy);
    }

    set fireEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.FireEfficacy, value);
    }

    get windEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.WindEfficacy);
    }

    set windEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.WindEfficacy, value);
    }

    get timeEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.TimeEfficacy);
    }

    set timeEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.TimeEfficacy, value);
    }

    get spaceEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.SpaceEfficacy);
    }

    set spaceEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.SpaceEfficacy, value);
    }

    get mirageEfficacy(): number {
        return this.readU8(Offsets.BattleCharacter.MirageEfficacy);
    }

    set mirageEfficacy(value: number) {
        this.writeU8(Offsets.BattleCharacter.MirageEfficacy, value);
    }

    // Values from t_mons.tbl, not used live in battle.
    // Changing some of these changes an enemy after restarting fight, no real need for this so no setters.
    get algoFileName(): string {
        return this.readPointer(Offsets.BattleCharacter.AlgoFileName).readAnsiString()!;
    }

    get modelName(): string {
        return this.readPointer(Offsets.BattleCharacter.ModelName).readAnsiString()!;
    }

    get aniName(): string {
        return this.readPointer(Offsets.BattleCharacter.AniName).readAnsiString()!;
    }

    get modelScale(): number {
        return this.readFloat(Offsets.BattleCharacter.ModelScale);
    }

    get cameraPivotHeight(): number {
        return this.readFloat(Offsets.BattleCharacter.CameraPivotHeight);
    }

    get float1(): number {
        return this.readFloat(Offsets.BattleCharacter.float1);
    }

    get float2(): number {
        return this.readFloat(Offsets.BattleCharacter.float2);
    }

    get float3(): number {
        return this.readFloat(Offsets.BattleCharacter.float3);
    }

    get float4(): number {
        return this.readFloat(Offsets.BattleCharacter.float4);
    }

    get float5(): number {
        return this.readFloat(Offsets.BattleCharacter.float5);
    }

    get short6(): number {
        return this.readU16(Offsets.BattleCharacter.short6);
    }

    get short7(): number {
        return this.readU16(Offsets.BattleCharacter.short7);
    }

    get HPBase(): number {
        return this.readU32(Offsets.BattleCharacter.HPBase);
    }

    get HPMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.HPMultiplier);
    }

    get EPBase(): number {
        return this.readU32(Offsets.BattleCharacter.EPMax);
    }

    get EPInit(): number {
        return this.readFloat(Offsets.BattleCharacter.EPInit);
    }

    get CPBase(): number {
        return this.readU32(Offsets.BattleCharacter.CPMax);
    }

    get CPInit(): number {
        return this.readFloat(Offsets.BattleCharacter.CPInit);
    }

    get STRBase(): number {
        return this.readU32(Offsets.BattleCharacter.STRBase);
    }

    get STRMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.STRMultiplier);
    }

    get DEFBase(): number {
        return this.readU32(Offsets.BattleCharacter.DEFBase);
    }

    get DEFMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.DEFMultiplier);
    }

    get ATSBase(): number {
        return this.readU32(Offsets.BattleCharacter.ATSBase);
    }

    get ATSMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.ATSMultiplier);
    }

    get ADFBase(): number {
        return this.readU32(Offsets.BattleCharacter.ADFBase);
    }

    get ADFMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.ADFMultiplier);
    }

    get DEXBase(): number {
        return this.readU32(Offsets.BattleCharacter.DEXBase);
    }

    get DEXMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.DEXMultiplier);
    }

    get AGLBase(): number {
        return this.readU16(Offsets.BattleCharacter.AGLBase);
    }

    get AGLMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.AGLMultiplier);
    }

    get EVABase(): number {
        return this.readU16(Offsets.BattleCharacter.EVABase)
    }

    get SPDBase(): number {
        return this.readU16(Offsets.BattleCharacter.SPDBase);
    }

    get SPDMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.SPDMultiplier);
    }

    get MOVBase(): number {
        return this.readU16(Offsets.BattleCharacter.MOVBase);
    }

    get MOVMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.MOVMultiplier);
    }

    get EXPBase(): number {
        return this.readU16(Offsets.BattleCharacter.EXPBase);
    }

    get EXPMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.EXPMultiplier);
    }

    get BreakBase(): number {
        return this.readU16(Offsets.BattleCharacter.BreakBase);
    }

    get BreakMultiplier(): number {
        return this.readFloat(Offsets.BattleCharacter.BreakMultiplier);
    }

    get name(): string {
        return this.readPointer(Offsets.BattleCharacter.Name).readAnsiString()!;
    }

    get description(): string {
        return this.readPointer(Offsets.BattleCharacter.Description).readAnsiString()!;
    }

}

class Character extends ED8BaseObject {
    get name(): string {
        return this.readUtf8String(Offsets.Character.Name)!;
    }

    set name(str: string) {
        this.writeUtf8String(Offsets.Character.Name, str);
    }
}