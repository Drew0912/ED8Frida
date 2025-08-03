import { Interceptor2 } from "../../utils";
import { Addrs } from "../addrs";
import * as utils from "../../utils";

export function BGMReplace() {
    const playBGM = Interceptor2.jmp(
        Addrs.PlayBGM,
        function(self: NativePointer, id: number, arg3: number, fadein: number, arg5: number, stream: number, arg7: number, fadeout: number,): NativePointer {
            // utils.log(`     self: ${self}`);
            // utils.log(`     id: ${id}`);
            // utils.log(`     arg3: ${arg3}`);
            // utils.log(`     fadein: ${fadein}`);
            // utils.log(`     arg5: ${arg5}`); //start Offset??? end offset is self + 0x5f08E8
            // utils.log(`     stream: ${stream}`);
            // utils.log(`     arg7: ${arg7}`);
            // utils.log(`     fadeout: ${fadeout}`);

            const ret = playBGM(self, id, arg3, fadein, arg5, stream, arg7, fadeout);

            return ret;
        },
        'pointer', ['pointer', 'uint16', 'float', 'float', 'uint32', 'uint32', 'bool', 'float'],
    );


}