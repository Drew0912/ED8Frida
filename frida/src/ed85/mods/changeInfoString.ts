import { Addrs } from "../addrs";

// Data
export function changeTitleVerString2(str: string="ED8Frida", includeOriginalString: boolean=true) {
    let originalString = "";
    if (includeOriginalString){
        originalString = Addrs.InfoString.TitleScreenVerStringData.readAnsiString()!;
    }
    Memory.patchCode(Addrs.InfoString.TitleScreenVerStringData, 7, (code) => {
        code.writeAnsiString(`${str} ${originalString}`);
    });
}

// Code
export function changeTitleVerString(str: string="ED8Frida", includeOriginalString: boolean=true) {
    let replaceVal: NativePointer;
    Interceptor.attach(Addrs.InfoString.TitleScreenVerStringCode, {
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

export function addToWindowText(str: string="") {
    let replaceVal: NativePointer;
    Interceptor.attach(Addrs.InfoString.WindowTextString, {
        onEnter: function() {
            const ctx = (this.context as X64CpuContext);
            let originalString = ctx.rdx.readAnsiString()!
            replaceVal = Memory.allocAnsiString(`${originalString} | Frida Enabled ${str}`);
            ctx.rdx = replaceVal;
        },
    });
}
