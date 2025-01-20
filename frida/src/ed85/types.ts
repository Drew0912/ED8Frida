import * as json5 from "json5"
import * as path from "path"
import { Modules } from "../modules";
import { Addrs, Offsets} from "./addrs";
import { ED8BaseObject, ED8Vector, Interceptor2, isPathExists} from "../utils";
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

export interface IConfig {
    patchDirs   : string[];
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
}

export class ED85 extends ED8BaseObject {
    private static _sharedInstance: ED85;
    private static _config: IConfig | undefined;

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

    static getConfig(): IConfig | undefined {
        if (this._config)
            return this._config;

        this._config = function() {
            const exePath = path.join(path.dirname(path.dirname(path.dirname(Modules.ED85.path.split('\\').join('/')))), 'bin', 'Win64', 'config_ED8Frida.json5');
            // utils.log('config file location: %s', exePath);
            const config = utils.readFileContent(exePath);
            if (!config)
                return undefined;

            const s = Buffer.from(config).toString('utf8');

            try {
                const cfg: IConfig = json5.parse(s);
                return cfg;
            } catch (e) {
                utils.log('load config: %s', e);
            }

            return undefined;
        }();

        return this._config;
    }
    
}