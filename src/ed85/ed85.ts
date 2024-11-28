

export function main() {
    (new NativeFunction(Process.getModuleByName('KERNEL32.DLL').getExportByName('AllocConsole'), "bool", [], 'win64'))();
}