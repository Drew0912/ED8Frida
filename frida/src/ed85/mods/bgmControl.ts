import { Interceptor2 } from "../../utils";
import { Addrs } from "../addrs";
import * as utils from "../../utils";

type ReplacedBGMPair = {oldBGMId: number, replacedBGMId: number};
interface IReplacedBGM {
    replacedBGM : ReplacedBGMPair[]
};

let replacedBGMData: IReplacedBGM = {
    replacedBGM : []
};

export function resetReplacedBGMList() {
    replacedBGMData.replacedBGM = [];
}

export function addToReplacedBGMList(BgmPair: ReplacedBGMPair) {
    let isReplacing = false;
    for(let i = 0; i < replacedBGMData.replacedBGM.length; i++) {
        if (replacedBGMData.replacedBGM[i].oldBGMId == BgmPair.oldBGMId){
            replacedBGMData.replacedBGM[i].replacedBGMId = BgmPair.replacedBGMId;
            isReplacing = true;
            break;
        }
    }

    if(!isReplacing) {
        replacedBGMData.replacedBGM.push(BgmPair);
    }
}

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

            for(const entry of replacedBGMData.replacedBGM) {
                if (id == entry.oldBGMId)
                    return playBGM(self, entry.replacedBGMId, arg3, fadein, arg5, stream, arg7, fadeout);
            }
            const ret = playBGM(self, id, arg3, fadein, arg5, stream, arg7, fadeout);

            utils.log(JSON.stringify(replacedBGMData));
            return ret;
        },
        'pointer', ['pointer', 'uint16', 'float', 'float', 'uint32', 'uint32', 'bool', 'float'],
    );

}