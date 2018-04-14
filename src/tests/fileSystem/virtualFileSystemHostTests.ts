import { ts } from "../../typescript";
import { expect } from "chai";
import { VirtualFileSystemHost } from "../../fileSystem";
import * as errors from "../../errors";

describe(nameof(VirtualFileSystemHost), () => {
    describe("constructor", () => {
        it("should have the main directory after being constructed", () => {
            expect(new VirtualFileSystemHost().directoryExistsSync("/")).to.be.true;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.getCurrentDirectory), () => {
        it("should have a current directory of just a forward slash", () => {
            expect(new VirtualFileSystemHost().getCurrentDirectory()).to.equal("/");
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.deleteSync), () => {
        it("should delete a file", () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            fs.writeFileSync(filePath, "");
            fs.deleteSync(filePath);
            expect(fs.fileExistsSync("/dir/file.ts")).to.be.false;
        });

        it("should delete a directory and all its sub directories", () => {
            const fs = new VirtualFileSystemHost();
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
            const fs = new VirtualFileSystemHost();
            expect(() => fs.deleteSync("/somePath")).to.throw(errors.FileNotFoundError);
        });

        it("should throw an error deleting a file that doesn't exist", () => {
            const fs = new VirtualFileSystemHost();
            fs.mkdirSync("dir");
            expect(() => fs.deleteSync("/dir/file.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.delete), () => {
        // most tests done in deleteSync
        it("should delete a file", async () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            fs.writeFileSync(filePath, "");
            await fs.delete(filePath);
            expect(fs.fileExistsSync("/dir/file.ts")).to.be.false;
        });

        it("should throw an error deleting a directory that doesn't exist", async () => {
            const fs = new VirtualFileSystemHost();
            let caughtErr: any;
            try {
                await fs.delete("/somePath");
            } catch (err) {
                caughtErr = err;
            }
            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.readDirSync), () => {
        it("should read a directory that exists", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("/dir/file.ts", "");
            fs.writeFileSync("/dir/subDir/file.ts", "");
            fs.writeFileSync("/dir2/file.ts", "");
            fs.writeFileSync("/file.ts", "");
            expect(fs.readDirSync("/dir")).to.deep.equal(["/dir/subDir", "/dir/file.ts"]);
        });

        it("should throw when reading a directory that doesn't exists", () => {
            const fs = new VirtualFileSystemHost();
            expect(() => fs.readDirSync("/dir")).to.throw(errors.DirectoryNotFoundError);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.readFileSync), () => {
        it("should read a file that exists", () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should throw reading a file that doesn't exist", () => {
            const fs = new VirtualFileSystemHost();
            expect(() => fs.readFileSync("/NonExistent.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.readFile), () => {
        it("should read a file that exists", async () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(await fs.readFile(filePath)).to.equal(text);
        });

        it("should throw reading a file that doesn't exist", async () => {
            const fs = new VirtualFileSystemHost();
            let thrownErr: any;
            try {
                await fs.readFile("/NonExistent.ts");
            } catch (err) {
                thrownErr = err;
            }
            expect(thrownErr).to.be.instanceof(errors.FileNotFoundError);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.writeFileSync), () => {
        it("should write a file", () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should over write a file that exists", () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            fs.writeFileSync(filePath, "");
            fs.writeFileSync(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should create the directories", () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/subdir/file.ts";
            fs.writeFileSync(filePath, "");
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.writeFile), () => {
        it("should write a file", async () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            await fs.writeFile(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });

        it("should over write a file that exists", async () => {
            const fs = new VirtualFileSystemHost();
            const filePath = "/dir/file.ts";
            const text = "some text";
            await fs.writeFile(filePath, "");
            await fs.writeFile(filePath, text);
            expect(fs.readFileSync(filePath)).to.equal(text);
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.mkdirSync), () => {
        it("should create the directory and all its parent directories", () => {
            const fs = new VirtualFileSystemHost();
            const path = "/dir/subdir";
            fs.mkdirSync(path);
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.mkdir), () => {
        it("should create the directory and all its parent directories", async () => {
            const fs = new VirtualFileSystemHost();
            const path = "/dir/subdir";
            await fs.mkdir(path);
            expect(fs.directoryExistsSync("/dir")).to.be.true;
            expect(fs.directoryExistsSync("/dir/subdir")).to.be.true;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.fileExists), () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("/file.ts", "");

        it("should return true for a file that exists", async () => {
            expect(await fs.fileExists("/file.ts")).to.be.true;
        });

        it("should return false for a file that doesn't exist", async () => {
            expect(await fs.fileExists("/file2.ts")).to.be.false;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.fileExistsSync), () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("/file.ts", "");

        it("should return true for a file that exists", () => {
            expect(fs.fileExistsSync("/file.ts")).to.be.true;
        });

        it("should return false for a file that doesn't exist", async () => {
            expect(fs.fileExistsSync("/file2.ts")).to.be.false;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.directoryExists), () => {
        const fs = new VirtualFileSystemHost();
        fs.mkdirSync("/dir");

        it("should return true for a directory that exists", async () => {
            expect(await fs.directoryExists("/dir")).to.be.true;
        });

        it("should return false for a directory that doesn't exist", async () => {
            expect(await fs.directoryExists("/dir2")).to.be.false;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.directoryExistsSync), () => {
        const fs = new VirtualFileSystemHost();
        fs.mkdirSync("/dir");

        it("should return true for a directory that exists", () => {
            expect(fs.directoryExistsSync("/dir")).to.be.true;
        });

        it("should return false for a directory that doesn't exist", async () => {
            expect(fs.directoryExistsSync("/dir2")).to.be.false;
        });
    });

    describe(nameof<VirtualFileSystemHost>(h => h.glob), () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("/dir/file1.ts", "");
        fs.writeFileSync("/dir/file1.d.ts", "");
        fs.writeFileSync("/dir/subDir/file2.ts", "");
        fs.writeFileSync("/dir/file3.js", "");
        fs.writeFileSync("/otherDir/file4.ts", "");
        fs.writeFileSync("/dir2/file5.txt", "");
        fs.writeFileSync("/dir2/file6.ts", "");

        it("should match all the patterns provided", () => {
            expect(fs.glob(["/dir/**/*.ts", "/**/*.txt", "!/**/*.d.ts"])).to.deep.equal([
                "/dir/file1.ts",
                "/dir/subDir/file2.ts",
                "/dir2/file5.txt"
            ]);
        });

        it("should match all the patterns provided for a relative path", () => {
            expect(fs.glob(["dir/subDir/**/*.ts"])).to.deep.equal([
                "/dir/subDir/file2.ts"
            ]);
        });

        it("should match all the patterns provided for a relative path with a dot", () => {
            expect(fs.glob(["./dir/subDir/**/*.ts"])).to.deep.equal([
                "/dir/subDir/file2.ts"
            ]);
        });
    });
});
