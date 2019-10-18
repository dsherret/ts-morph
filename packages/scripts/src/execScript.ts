import { exec } from "child_process";

export function execScript(command: string, cwd: string) {
    return new Promise<string>((resolve, reject) => {
        exec(command, {
            cwd
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

export function execNpmScript(scriptName: string, cwd: string) {
    return execScript(`npm run ${scriptName} --no-update-notifier --scripts-prepend-node-path`, cwd);
}
