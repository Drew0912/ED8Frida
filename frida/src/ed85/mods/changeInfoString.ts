import { Addrs } from "../addrs";
import * as utils from "../../utils";

// Data
export function changeTitleVerString2(str: string="ED8Frida Mod", includeOriginalString: boolean=true) {
    let originalString = "";
    if (includeOriginalString){
        originalString = Addrs.TitleScreenVerStringData.readAnsiString()!;
    }
    Memory.patchCode(Addrs.TitleScreenVerStringData, 7, (code) => {
        code.writeAnsiString(`${str} ${originalString}`);
    });
}

// Code
export function changeTitleVerString(str: string="ED8Frida Mod", includeOriginalString: boolean=true) {
    let replaceVal: NativePointer;
    Interceptor.attach(Addrs.TitleScreenVerStringCode, {
        onEnter: function() {
            const ctx = (this.context as X64CpuContext);
            let originalString = "";
            if (includeOriginalString) {
                originalString = ctx.rdx.readAnsiString()!;
            }
            replaceVal = Memory.allocAnsiString(`${str} ${originalString}`);
            ctx.rdx = replaceVal;
        },
    });
}