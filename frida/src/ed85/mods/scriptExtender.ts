import { Addrs } from "../addrs";
import { Interceptor2 } from "../../utils";
import { BattleProc, ED85 } from "../types";
import * as utils from "../../utils";

import { setLoggerLevel } from "./logger";
import { displayEnemyCPByName, replaceDescriptionWithEnemyStats } from "./advancedEnemyStats";

let tracing = false;
export function setTracing(bool : boolean) {
    tracing = bool;
}

export function hookScriptExtender() {
    const ScriptExtender = Interceptor2.jmp(
        Addrs.Script.ScriptInterpreter,
        function(ScriptScn : NativePointer, Script : NativePointer, Opcode : number) : number {
            // ScriptScn is the same as Script Class (at least for debug).
            // i.e ScriptScn == ED85.scriptManager.debug.pointer
            const opcodeInScriptOffset = (Script.add(0x78)).readU32();
            const scriptInMemory = (Script.add(0x70)).readPointer()!;

            if (tracing) {
                const scriptName = Script.add(0x14).readAnsiString()!;
                const currentFunction = Script.add(0x34).readAnsiString()!;
                utils.log(`    OP_%02X @ ${scriptName}.${currentFunction}.${Script}`, Opcode);
            }

            if (Opcode == 0xF1) { // Map instruction Call2(OP_F1) to DebugLog(OP_07).
                const stringInF1 = scriptInMemory.add(opcodeInScriptOffset + 7).readAnsiString()!; // DebugString hex representation -> 07 (** ** ** FF) 02 DD STRING.
                utils.log(`    Call2SE(${stringInF1})`);
                if (stringInF1.slice(0, 6) == 'SBreak'){
                    ED85.SBreak(parseInt(stringInF1.slice(7)));
                }            
                else if (stringInF1.slice(0, 6) == 'opcode') {
                    switch(stringInF1) {
                        case 'opcodeTracingOn': {
                            tracing = true;
                            break;
                        }
                        case 'opcodeTracingOff': {
                            tracing = false;
                            break;
                        }
                    }
                }
                else if (stringInF1.slice(0, 15) == 'OutputDebugInfo') {
                    switch(stringInF1) {
                        case 'OutputDebugInfo0': {
                            setLoggerLevel(0);
                            break;
                        }
                        case 'OutputDebugInfo1': {
                            setLoggerLevel(1);
                            break;
                        }
                        case 'OutputDebugInfo2': {
                            setLoggerLevel(2);
                            break;
                        }
                        case 'OutputDebugInfo3': {
                            setLoggerLevel(3);
                            break;
                        }
                    }
                }
                else if (stringInF1 == 'TestSE') {
                    utils.log("TestSE");
                }
                else if (stringInF1 == "TurnCounterEnemy") {
                    // Make it so that enemy turns do not increase this value.
                    ED85.battleProc.numberOfTurnsPassedInBattle--;
                }
                else if (stringInF1.slice(0,9) == 'DisplayCP') {
                    displayEnemyCPByName(parseInt(stringInF1.slice(10)));
                }
                else if (stringInF1.slice(0,11) == 'ReplaceDesc') {
                    replaceDescriptionWithEnemyStats(parseInt(stringInF1.slice(12)));
                }
                else {
                    utils.log(`ED8Frida.scriptExtender: Unknown string (${stringInF1})`);
                }
                return ScriptExtender(ScriptScn, Script, 7); 
            }

            // if (Opcode == 0x2D) { // Clear console log slightly.
            //     // utils.log(Opcode1.toString());
            //     return ScriptExtender(ScriptScn, Script, Opcode);
            // }

            return ScriptExtender(ScriptScn, Script, Opcode);
        },
        'bool', ['pointer', 'pointer', 'uint16'],
    );

    /*
    Version not replacing function to avoid crashing when using cheat engine.
    */
    // Interceptor.attach(ptr(0x14059dea0), function() {
    //     const ctx = (this.context as X64CpuContext);
    //     const offset = ctx.rdx.toUInt32();
    //     const script = ctx.rbx;
    //     const scriptName = script.add(0x14).readAnsiString()!;
    //     const currentFunction = script.add(0x34).readAnsiString()!;
    //     const opcode = ctx.r8.and(0xFF).toUInt32();

    //     const opcodeInScriptOffset = (script.add(0x78)).readU32();
    //     const scriptInMemory = (script.add(0x70)).readPointer()!;

    //     // utils.log(`    OP_${ctx.r8.and(0xFF).toUInt32().toString(16).toUpperCase()} @ ${scriptName}.${currentFunction}.${ptr(offset)}`);
    //     utils.log(`    OP_%02X @ ${scriptName}.${currentFunction}.${ptr(offset)}`, opcode);
    //     // utils.log(scriptInMemory.add(0x1C).readU32().toString(16)); //Magic bytes for game scripts (0xABCDEF00)
    //     // utils.log(scriptInMemory.add(opcodeInScriptOffset).readU8().toString(16)); //Opcode from scriptInMemory

    //     if (opcode == 0x07) { // Only output for DebugLog (OP_07)
    //         utils.log(scriptInMemory.add(opcodeInScriptOffset + 7).readAnsiString()!); // DebugString hex representation -> 07 (** ** ** FF) 02 DD STRING
    //     }
    //     // utils.log(`    OP_%02X @ ${scriptName}.${currentFunction}`, opcode);
    // });

}
