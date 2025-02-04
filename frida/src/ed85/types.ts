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

    private static playerSBreakFunction = new NativeFunction(Addrs.ED85.PlayerSBreak, 'uint16', ['pointer', 'pointer', 'bool', 'uint32', 'uint16']);

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
    
    static enemySBreak(enemyNumber: number) {
        ED85.playerSBreakFunction(ED85.battleProc.SBreakParam1, BattleProc.getBattleCharWorkForEnemyNumber(enemyNumber), 1, 0, 0);
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

    static getBattleCharWorkForEnemyNumber(enemyNumber: number): NativePointer {
        let value = 0;
        for (let i = 0; i < 8; i++) {
            // 0x100 contains all BattleCharWork, 0x110 contains only player BattleCharWork
            const BattleCharWork100 = ED85.battleProc.allBattleCharWork.add(i*8).readPointer();
            const BattleCharWork110 = ED85.battleProc.onlyPlayerBattleCharWork.add(i*8).readPointer();
            if (!BattleCharWork100.equals(BattleCharWork110)) {
                value = i;
                break
            }
        }
        // utils.log("getBattleCharWorkForEnemyNumber: Should be number of party members: %s", value);
        return ED85.battleProc.allBattleCharWork.add((value+enemyNumber-1)*8).readPointer();
        
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