import { Addrs } from "../addrs";
import { Interceptor2 } from "../../utils";
import { ScriptManager, ScriptId, ED85 } from "../types";
import { API } from "../../modules";

export function loadDebug() {
    const ScriptManager_LoadLibrary = Interceptor2.jmp(
        Addrs.ScriptManager.LoadLibraries,
        function(self: NativePointer): number {
            const ret = ScriptManager_LoadLibrary(self);

            if (ret == 0) {
                const mgr = new ScriptManager(self);
                mgr.debug.loadDebug();
            }

            return ret;
        },
        'uint32', ['pointer'],
    );

    const ScriptManager_GetScriptById = Interceptor2.jmp(
        Addrs.ScriptManager.GetScriptByID,
        function(pointer: NativePointer, context: NativePointer, id: number): NativePointer {
            switch (id) {
                case ScriptId.Debug:
                    return ED85.scriptManager.debug.pointer;
            }

            return ScriptManager_GetScriptById(pointer, context, id);
        },
        'pointer', ['pointer', 'pointer', 'uint16'],
    );
}

export function hookActMenu(func: string) {
    const handleActMenu = Interceptor2.jmp(
        Addrs.ED85.HandleActMenu,
        function(arg1: NativePointer, arg2: number): number {
            const VK_SHIFT = 0x10;

            if (API.USER32.GetAsyncKeyState(VK_SHIFT) >= 0) {
                return handleActMenu(arg1, arg2);
            }

            ScriptManager.getScriptByID(ScriptId.Debug)?.call(ED85.scriptManager.getThreadContext(), func, 0, 1);

            return 0;
        },
        'uint8', ['pointer', 'double'],
    );
}