import { expect } from "chai";
import { errors } from "../../errors";
import { InMemoryFileSystemHost } from "../../fileSystem";
import { getLibFiles } from "../../getLibFiles";

describe(nameof(InMemoryFileSystemHost), () => {
    describe("constructor", () => {
        it("should have the main directory after being constructed", () => {
            expect(new InMemoryFileSystemHost().directoryExistsSync("/")).to.be.true;
        });

        it("should load the lib files by default", () => {
            const fileSystem = new InMemoryFileSystemHost();
            expect(fileSystem.readDirSync("/")).to.deep.equal(["/node_modules"]);
            expect(fileSystem.readDirSync("/node_modules/typescript/lib")).to.deep.equal(getLibFiles().map(file => {
                return `/node_modules/typescript/lib/${file.fileName}`;
            }));
        });

        it("should not load the lib files when specifying not to", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            expect(fileSystem.readDirSync("/")).to.deep.equal([]);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.getCurrentDirectory), () => {
        it("should have a current directory of just a forward slash", () => {
            expect(new InMemoryFileSystemHost().getCurrentDirectory()).to.equal("/");
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.deleteSync), () => {
        it("should delete a file", () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            fs.writeFileSync(filePath, "");
            fs.deleteSync(filePath);
            expect(fs.fileExistsSync("/dir/file.ts")).to.be.false;
        });

        it("should delete a directory and all its sub directories", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/dir/file.ts", "");
            fs.writeFileSync("/dir/subdir/file.ts", "");
            fs.writeFileSync("/otherDir/subdir/file.ts", "");
            fs.deleteSync("/dir");
            expect(fs.fileExistsSync("/dir/file.ts")).to.be.false;
            expect(fs.fileExistsSync("/dir/subdir/file.ts")).to.be.false;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.false;
            expect(fs.directoryExistsSync("/dir")).to.be.false;
            expect(fs.directoryExistsSync("/otherDir")).to.be.true;
            expect(fs.fileExistsSync("/otherDir/subdir/file.ts")).to.be.true;
        });

        it("should throw an error deleting a directory that doesn't exist", () => {
            const fs = new InMemoryFileSystemHost();
            expect(() => fs.deleteSync("/somePath")).to.throw(errors.FileNotFoundError);
        });

        it("should throw an error deleting a file that doesn't exist", () => {
            const fs = new InMemoryFileSystemHost();
            fs.mkdirSync("dir");
            expect(() => fs.deleteSync("/dir/file.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.delete), () => {
        // most tests done in deleteSync
        it("should delete a file", async () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            fs.writeFileSync(filePath, "");
            await fs.delete(filePath);
            expect(fs.fileExistsSync("/dir/file.ts")).to.be.false;
        });

        it("should throw an error deleting a directory that doesn't exist", async () => {
            const fs = new InMemoryFileSystemHost();
            let caughtErr: any;
            try {
                await fs.delete("/somePath");
            } catch (err) {
                caughtErr = err;
            }
            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.readDirSync), () => {
        it("should read a directory that exists", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/dir/file.ts", "");
            fs.writeFileSync("/dir/subDir/file.ts", "");
            fs.writeFileSync("/dir2/file.ts", "");
            fs.writeFileSync("/file.ts", "");
            expect(fs.readDirSync("/dir")).to.deep.equal(["/dir/subDir", "/dir/file.ts"]);
        });

        it("should throw when reading a directory that doesn't exists", () => {
            const fs = new InMemoryFileSystemHost();
            expect(() => fs.readDirSync("/dir")).to.throw(errors.DirectoryNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.readFileSync), () => {
        it("should read a file that exists", () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should throw reading a file that doesn't exist", () => {
            const fs = new InMemoryFileSystemHost();
            expect(() => fs.readFileSync("/NonExistent.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.readFile), () => {
        it("should read a file that exists", async () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(await fs.readFile(filePath)).to.equal(text);
        });

        it("should throw reading a file that doesn't exist", async () => {
            const fs = new InMemoryFileSystemHost();
            let thrownErr: any;
            try {
                await fs.readFile("/NonExistent.ts");
            } catch (err) {
                thrownErr = err;
            }
            expect(thrownErr).to.be.instanceof(errors.FileNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.writeFileSync), () => {
        it("should write a file", () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should over write a file that exists", () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, "");
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should create the directories", () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/subdir/file.ts";
            fs.writeFileSync(filePath, "");
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.writeFile), () => {
        it("should write a file", async () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            await fs.writeFile(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should over write a file that exists", async () => {
            const fs = new InMemoryFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            await fs.writeFile(filePath, "");
            await fs.writeFile(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.mkdirSync), () => {
        it("should create the directory and all its parent directories", () => {
            const fs = new InMemoryFileSystemHost();
            const path = "/dir/subdir";
            fs.mkdirSync(path);
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.mkdir), () => {
        it("should create the directory and all its parent directories", async () => {
            const fs = new InMemoryFileSystemHost();
            const path = "/dir/subdir";
            await fs.mkdir(path);
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.copy), () => {
        // this will test copySync because this calls copySync

        it("should copy a directory and all its sub directories", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/dir/subdir/file.ts", "text");
            fs.writeFileSync("/dir/subdir/nextSubDir/test.ts", "text2");
            await fs.copy("/dir/subdir", "/newDir/newSubDir");

            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
            expect(fs.readFileSync("/dir/subdir/file.ts")).to.equal("text");
            expect(fs.readFileSync("/dir/subdir/nextSubDir/test.ts")).to.equal("text2");
            expect(fs.directoryExistsSync("/newDir")).to.be.true;
            expect(fs.directoryExistsSync("/newDir/newSubDir")).to.be.true;
            expect(fs.directoryExistsSync("/newDir/newSubDir/nextSubDir")).to.be.true;
            expect(fs.readFileSync("/newDir/newSubDir/file.ts")).to.equal("text");
            expect(fs.readFileSync("/newDir/newSubDir/nextSubDir/test.ts")).to.equal("text2");
        });

        it("should merge when copying into another directory", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from/file.ts", "text");
            fs.writeFileSync("/from/sub/subFile.ts", "text");
            fs.writeFileSync("/to/file.ts", "original");
            fs.writeFileSync("/to/test.ts", "text2");
            fs.writeFileSync("/to/sub/subFile2.ts", "text3");
            await fs.copy("/from", "/to");

            expect(fs.directoryExistsSync("/from")).to.be.true;
            expect(fs.directoryExistsSync("/from/sub")).to.be.true;
            expect(fs.directoryExistsSync("/to/sub")).to.be.true;
            expect(fs.readFileSync("/to/file.ts")).to.equal("text");
            expect(fs.readFileSync("/to/test.ts")).to.equal("text2");
            expect(fs.readFileSync("/to/sub/subFile2.ts")).to.equal("text3");
        });

        it("should copy a file and create the directory it's being copied to", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from/file.ts", "text");
            await fs.copy("/from/file.ts", "/to/to.ts");

            expect(fs.directoryExistsSync("/from")).to.be.true;
            expect(fs.directoryExistsSync("/to")).to.be.true;
            expect(fs.readFileSync("/to/to.ts")).to.equal("text");
        });

        it("should copy a file and overwrite the file it's being copied to", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from.ts", "text");
            fs.writeFileSync("/to.ts", "text2");
            await fs.copy("/from.ts", "/to.ts");

            expect(fs.readFileSync("/from.ts")).to.equal("text");
            expect(fs.readFileSync("/to.ts")).to.equal("text");
        });

        it("should throw when copying a path that doesn't exist", async () => {
            const fs = new InMemoryFileSystemHost();
            let thrownErr: any;
            try {
                await fs.copy("/from.ts", "/to.ts");
            } catch (err) {
                thrownErr = err;
            }

            expect(thrownErr).to.be.instanceof(errors.PathNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.move), () => {
        // this will test moveSync because this calls moveSync

        it("should move a directory and all its sub directories", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/dir/subdir/file.ts", "text");
            fs.writeFileSync("/dir/subdir/nextSubDir/test.ts", "text2");
            await fs.move("/dir/subdir", "/newDir/newSubDir");

            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.false;
            expect(fs.directoryExistsSync("/newDir")).to.be.true;
            expect(fs.directoryExistsSync("/newDir/newSubDir")).to.be.true;
            expect(fs.readFileSync("/newDir/newSubDir/file.ts")).to.equal("text");
            expect(fs.directoryExistsSync("/newDir/newSubDir/nextSubDir")).to.be.true;
            expect(fs.readFileSync("/newDir/newSubDir/nextSubDir/test.ts")).to.equal("text2");
        });

        it("should merge two directories", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from/file.ts", "text");
            fs.writeFileSync("/from/sub/subFile.ts", "text");
            fs.writeFileSync("/to/file.ts", "original");
            fs.writeFileSync("/to/test.ts", "text2");
            fs.writeFileSync("/to/sub/subFile2.ts", "text3");
            await fs.move("/from", "/to");

            expect(fs.directoryExistsSync("/from")).to.be.false;
            expect(fs.directoryExistsSync("/from/sub")).to.be.false;
            expect(fs.directoryExistsSync("/to/sub")).to.be.true;
            expect(fs.readFileSync("/to/file.ts")).to.equal("text");
            expect(fs.readFileSync("/to/test.ts")).to.equal("text2");
            expect(fs.readFileSync("/to/sub/subFile2.ts")).to.equal("text3");
        });

        it("should move a file and create the directory it's being moved to", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from/file.ts", "text");
            await fs.move("/from/file.ts", "/to/to.ts");

            expect(fs.directoryExistsSync("/from")).to.be.true;
            expect(fs.directoryExistsSync("/to")).to.be.true;
            expect(fs.readFileSync("/to/to.ts")).to.equal("text");
        });

        it("should move a file and overwrite the file it's being moved to", async () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/from.ts", "text");
            fs.writeFileSync("/to.ts", "text2");
            await fs.move("/from.ts", "/to.ts");

            expect(fs.fileExistsSync("/from.ts")).to.be.false;
            expect(fs.readFileSync("/to.ts")).to.equal("text");
        });

        it("should throw when moving a path that doesn't exist", async () => {
            const fs = new InMemoryFileSystemHost();
            let thrownErr: any;
            try {
                await fs.move("/from.ts", "/to.ts");
            } catch (err) {
                thrownErr = err;
            }

            expect(thrownErr).to.be.instanceof(errors.PathNotFoundError);
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.fileExists), () => {
        const fs = new InMemoryFileSystemHost();
        fs.writeFileSync("/file.ts", "");

        it("should return true for a file that exists", async () => {
            expect(await fs.fileExists("/file.ts")).to.be.true;
        });

        it("should return false for a file that doesn't exist", async () => {
            expect(await fs.fileExists("/file2.ts")).to.be.false;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.fileExistsSync), () => {
        const fs = new InMemoryFileSystemHost();
        fs.writeFileSync("/file.ts", "");

        it("should return true for a file that exists", () => {
            expect(fs.fileExistsSync("/file.ts")).to.be.true;
        });

        it("should return false for a file that doesn't exist", async () => {
            expect(fs.fileExistsSync("/file2.ts")).to.be.false;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.directoryExists), () => {
        const fs = new InMemoryFileSystemHost();
        fs.mkdirSync("/dir");

        it("should return true for a directory that exists", async () => {
            expect(await fs.directoryExists("/dir")).to.be.true;
        });

        it("should return false for a directory that doesn't exist", async () => {
            expect(await fs.directoryExists("/dir2")).to.be.false;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.directoryExistsSync), () => {
        const fs = new InMemoryFileSystemHost();
        fs.mkdirSync("/dir");

        it("should return true for a directory that exists", () => {
            expect(fs.directoryExistsSync("/dir")).to.be.true;
        });

        it("should return false for a directory that doesn't exist", async () => {
            expect(fs.directoryExistsSync("/dir2")).to.be.false;
        });
    });

    describe(nameof<InMemoryFileSystemHost>(h => h.globSync), () => {
        const fs = new InMemoryFileSystemHost();
        fs.writeFileSync("/dir/file1.ts", "");
        fs.writeFileSync("/dir/file1.d.ts", "");
        fs.writeFileSync("/dir/subDir/file2.ts", "");
        fs.writeFileSync("/dir/file3.js", "");
        fs.writeFileSync("/otherDir/file4.ts", "");
        fs.writeFileSync("/dir2/file5.txt", "");
        fs.writeFileSync("/dir2/file6.ts", "");

        it("should match all the patterns provided", () => {
            expect(fs.globSync(["/dir/**/*.ts", "/**/*.txt", "!/**/*.d.ts"])).to.deep.equal([
                "/dir/file1.ts",
                "/dir/subDir/file2.ts",
                "/dir2/file5.txt"
            ]);
        });

        it("should match all the patterns provided for a relative path", () => {
            expect(fs.globSync(["dir/subDir/**/*.ts"])).to.deep.equal([
                "/dir/subDir/file2.ts"
            ]);
        });

        it("should match all the patterns provided for a relative path with a dot", () => {
            expect(fs.globSync(["./dir/subDir/**/*.ts"])).to.deep.equal([
                "/dir/subDir/file2.ts"
            ]);
        });
    });
});
