import { Addrs } from "../addrs";
import * as utils from "../../utils";
import { Interceptor2 } from "../../utils";

enum LoggerLevel {
    NoInfo = 0,
    Printf = 1,
    Logger2 = 2, // less info, more accurate
    StringFormatOnly = 3,
}

let loggerLevel = LoggerLevel.NoInfo;
export function setLoggerLevel(value: number) {
    loggerLevel = value;
}

// Param1 = level, Param2 = format, Param3... = ...args.
function hookLoggerPrintf() {
    //some implementation of printf
    Interceptor.attach(Addrs.Logger.Output_Printf, {
        onEnter: function(args) {
            if (loggerLevel == LoggerLevel.Printf) {
                // const intLevel = args[0].toInt32()!;
                // utils.log(intLevel.toString()); 

                const format = args[1].readUtf8String()!;
                const formatLength = format.length;

                // var vsprintf = require('sprintf-js').vsprintf;

                let count = 0, argCount = 2;
                let s = "";
                while(count < formatLength) {
                    // % (special char) found, want to replace
                    if(format.charAt(count) === '%') {
                        switch (format.charAt(count+1)) {
                            case 'd': // number
                                s = s.concat(args[argCount].toInt32()!.toString());
                                argCount++;
                                count = count + 2;
                                break; 
                            case '4': // number 4d
                            case '3': // number 3d
                            case '2': // number 2d
                                if (format.charAt(count+2) === 'd') {
                                    s = s.concat(args[argCount].toInt32()!.toString());
                                    argCount++;
                                    count = count + 3;
                                    break; 
                                }
                            case 'p': // pointer
                            case 'x': // hex value
                                // s = s.concat(args[argCount].readPointer()!.toString());
                                s = s.concat(args[argCount].toString());
                                argCount++;
                                count = count + 2;
                                break;
                            case 's': // string
                                s = s.concat(args[argCount].readUtf8String()!);
                                argCount++;
                                count = count + 2;
                                break;
                            case 'f': // float
                                s = s.concat(utils.hexDoubletoDouble(args[argCount].toString()!).toString());
                                argCount++;
                                count = count + 2;
                                break;
                            case '.': // .2f, .4f, .1f, .0f (float)
                                if (format.charAt(count+2) === '2' || format.charAt(count+2) === '4' || format.charAt(count+2) === '1' || format.charAt(count+2) === '0') {
                                    s = s.concat(utils.hexDoubletoDouble(args[argCount].toString()!).toString());
                                    argCount++;
                                    count = count + 4;
                                }
                            case '1': //1.0f (float)
                                if (format.charAt(count+2) === '.') {
                                    s = s.concat(utils.hexDoubletoDouble(args[argCount].toString()!).toString())
                                    argCount++;
                                    count = count + 5;
                                }
                            case '0': //08x (address)
                                if (format.charAt(count+2) === '8') {
                                    if (format.charAt(count+3) === 'x') {
                                        s = s.concat(args[argCount].toString()!.slice(2).padStart(8, '0'));
                                        argCount++;
                                        count = count + 4;
                                        break;
                                    }
                                }
                            // case '%': //special char
                            //     s = s.concat('%');
                            //     count = count + 2;
                            //     break;
                        }
                    }
                    switch(format.charCodeAt(count)) { // Unknown characters.
                        case 9484://0xE2 UTF8
                            s = s.concat('|');
                            count = count + 1;
                            break;
                        case 65372: //i.e MasterQuartz(Sophia)
                            s = s.concat('|');
                            count = count + 1;
                            break;
                        case 9492: //i.e -----------
                            s = s.concat("-");
                            count = count + 1;
                            break;
                        // case 9474: //i.e 30:Elie AT:1 (Doesn't work)
                        //     s = s.concat("|");
                        //     count = count + 1;
                        //     break;
                        case 12295: //i.e createBattleCharacter
                            s = s.concat('|');
                            count = count + 1;
                            break;
                    }
                    s = s.concat(format.charAt(count)); 
                    count++;
                }
                // utils.log(format.charCodeAt(0).toString());
                if (s.substring(s.length - 1) == '\n') {
                    utils.log(s.substring(0, s.length - 1));
                } else {
                    utils.log(s);
                }
                // utils.log(s.slice(0, -1)); //-1 to cut newline char.
            }
            else if (loggerLevel == LoggerLevel.StringFormatOnly) {
                const format = args[1].readUtf8String()!;
                utils.log(format);
            }
        },
    })
}

// More accurate logger but gives less information.
function Logger2() {
    Interceptor2.jmp(
        Addrs.Logger.Ansi2UTF8,
        function(output: NativePointer, outputSize: NativePointer, input: NativePointer) {
            if (loggerLevel == LoggerLevel.Logger2) {
                const s = input.readUtf8String()!;
                output.writeUtf8String(s.slice(0, outputSize.toUInt32()));
            }
        },
        'void', ['pointer', 'pointer', 'pointer'],
    );

    const Logger_Output = Interceptor2.jmp(
        Addrs.Logger.OutputDebugStringW,
        function(self: NativePointer, level: NativePointer, buffer: NativePointer) {
            if (loggerLevel == LoggerLevel.Logger2) {
                const buf = buffer.readUtf8String()!;
                if (buf.substring(buf.length - 1) == '\n') {
                    utils.log(buf.substring(0, buf.length - 1));
                } else {
                    utils.log(buf);
                }
            }
            Logger_Output(self, level, buffer);
        },
        'void', ['pointer', 'pointer', 'pointer'],
    );
}

export function outputDebugInfo(level: number) {
    loggerLevel = level;
    // Do hooks
    hookLoggerPrintf()
    Logger2()
}