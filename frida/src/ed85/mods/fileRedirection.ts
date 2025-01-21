import { Addrs } from "../addrs";
import { Interceptor2 } from "../../utils";
import * as utils from "../../utils";
import { API } from "../../modules";
import { sprintf } from "sprintf-js";

export function fileRedirection() {
    const File_Open = Interceptor2.jmp(
        Addrs.File.Open,
        function(self: NativePointer, path: NativePointer, mode: NativePointer): NativePointer {
            const patch = utils.getPatchFile(path.readAnsiString()!);
            if (patch) {
                path = Memory.allocAnsiString(patch);
            }

            return File_Open(self, path, mode);
        },
        'pointer', ['pointer', 'pointer', 'pointer'],
    );

    // data/se/
    // data/bgm/
    // Mostly just sound files
    // FileOpen also reads these paths but not all of them.
    const wfopen = Interceptor2.jmp(
        API.crt.wfopen,
        function(path: NativePointer, mode: NativePointer): NativePointer {
            const patch = utils.getPatchFile(path.readUtf16String()!);
            if (patch) {
                path = Memory.allocUtf16String(patch);
            }

            return wfopen(path, mode);
        },
        'pointer', ['pointer', 'pointer'],
    );

    // Unnecessary hook.
    // const fopen = Interceptor2.jmp(
    //     API.crt.fopen,
    //     function(path: NativePointer, mode: NativePointer): NativePointer {
    //         const patch = utils.getPatchFile(path.readUtf16String()!);
    //         if (patch) {
    //             path = Memory.allocUtf16String(patch);
    //         }

    //         return fopen(path, mode);
    //     },
    //     'pointer', ['pointer', 'pointer'],
    // );

    // Adding this fixes audio files from other folders not working. Still needs crt.wfopen to be intercepted.
    const File_GetSize = Interceptor2.jmp(
        Addrs.File.GetSize,
        function(self: NativePointer, path: NativePointer, arg3: NativePointer, fileSize: NativePointer): NativePointer {
            const patch = utils.getPatchFile(path.readAnsiString()!);
            if (patch) {
                path = Memory.allocAnsiString(patch);
            }

            return File_GetSize(self, path, arg3, fileSize);
        },
        'pointer', ['pointer', 'pointer', 'pointer', 'pointer'],
    );

    // DLC costumes.
    const DLCAssetIO = Interceptor2.jmp(
        Addrs.File.DLCAssetIO,
        function(self: NativePointer, fileName: NativePointer, pathFormat: NativePointer): NativePointer {
            if (pathFormat.readAnsiString() == null) {
                return DLCAssetIO(self, fileName, pathFormat);
            }

            const fullPath = sprintf(pathFormat.readAnsiString()!, fileName.readAnsiString()!);
            const patch = utils.getPatchFile(fullPath);
            if (patch) {
                pathFormat = Memory.allocAnsiString(patch);
            }

            return DLCAssetIO(self, fileName, pathFormat);
        },
        'pointer', ['pointer', 'pointer', 'pointer'],
    );
}
