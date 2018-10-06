import { exec } from "child_process";
import { rootFolder } from "../config";

export function execScript(command: string) {
    return new Promise((resolve, reject) => {
        exec(command, {
            cwd: rootFolder
        }, (err, stdout, stderr) => {
            if (err) {
                console.log(stdout);
                console.log(stderr);
                reject(err);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
}

export function execNpmScript(scriptName: string) {
    return execScript(`npm run ${scriptName} --no-update-notifier`);
}
