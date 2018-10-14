import * as fs from "fs-extra";
import * as path from "path";
import { EOL } from "os";
import { rootFolder } from "../config";

const emptyFileText = `"use strict";${EOL}Object.defineProperty(exports, "__esModule", { value: true });${EOL}`;
const emptyFileSize = Buffer.byteLength(emptyFileText, "utf-8");

handleDir(path.join(rootFolder, "dist"));

async function handleDir(dirPath: string) {
    const paths = await fs.readdir(dirPath);
    const promises: Promise<void>[] = [];

    for (const fileOrDirPath of paths)
        promises.push(handlePath(path.join(dirPath, fileOrDirPath)));

    await Promise.all(promises);

    // remove the directory if it's empty
    const newPaths = await fs.readdir(dirPath);
    if (newPaths.length === 0)
        await fs.rmdir(dirPath);

    async function handlePath(fileOrDirPath: string) {
        const stat = await fs.stat(fileOrDirPath);
        if (stat.isDirectory())
            await handleDir(fileOrDirPath);
        else
            await handleFile(fileOrDirPath, stat.size);
    }

    async function handleFile(filePath: string, fileSize: number) {
        if (fileSize !== emptyFileSize)
            return;

        const fileText = await fs.readFile(filePath, { encoding: "utf-8" });

        if (fileText === emptyFileText)
            await fs.unlink(filePath);
    }
}
