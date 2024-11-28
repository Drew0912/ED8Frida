import * as utils from "./utils";

function main() {
    switch (utils.getGameVersion()) {
        case 'ed83_cn':
            import("./ed83/ed83").then(ed83 => {
                ed83.main()
            });
            break;

        case 'ed84_jp':
        case 'ed84_us':
            import("./ed84/ed84").then(ed84 => {
                ed84.main()
            });
            break;

        case 'ed9':
            import("./ed9/ed9").then(ed9 => {
                ed9.main();
            });
            break;
        case 'ed85':
            import("./ed85/ed85").then(ed85 => {
                ed85.main();
            });
            break;
    }
}

console.log();
main();
