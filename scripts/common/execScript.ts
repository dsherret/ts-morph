import { exec } from "child_process";
import { rootFolder } from "../config";

export function execScript(command: string) {
    return new Promise((resolve, reject) => {
        exec(command, {
            cwd: rootFolder
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err)
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
    return execScript(`npm run ${scriptName}`);
}

export function execYarnInstall(packageName: string, version: string) {
    return execScript(`yarn add ${packageName}@${version}`);
}
