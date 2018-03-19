import {ts} from "../../typescript";
import {expect} from "chai";
import {VirtualFileSystemHost, FileSystemWrapper} from "../../fileSystem";
import {createHashSet, HashSet, ArrayUtils} from "../../utils";
import * as errors from "../../errors";

describe(nameof(FileSystemWrapper), () => {
    interface SetupObjects {
        fileSystem: VirtualFileSystemHost;
        wrapper: FileSystemWrapper;
        hashSet: HashSet<string>;
    }

    function setup(): SetupObjects {
        const fileSystem = new VirtualFileSystemHost();
        const hashSet = createHashSet<string>();
        return { fileSystem, hashSet, wrapper: new FileSystemWrapper(fileSystem, hashSet) };
    }

    function checkState(objs: SetupObjects, filePath: string, state: [boolean, boolean, boolean]) {
        expect(objs.wrapper.fileExistsSync(filePath)).to.equal(state[0], "wrapper");
        expect(objs.hashSet.has(filePath)).to.equal(state[1], "hash set");
        expect(objs.fileSystem.fileExistsSync(filePath)).to.equal(state[2], "file system");
    }

    function checkStateForDir(objs: SetupObjects, filePath: string, state: [boolean, boolean, boolean]) {
        expect(objs.wrapper.directoryExistsSync(filePath)).to.equal(state[0], "wrapper");
        expect(objs.hashSet.has(filePath)).to.equal(state[1], "hash set");
        expect(objs.fileSystem.directoryExistsSync(filePath)).to.equal(state[2], "file system");
    }

    describe(nameof<FileSystemWrapper>(w => w.queueDelete), () => {
        it("should queue a file for delete", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);

            checkState(objs, filePaths[0], [false, true, true]);
            checkState(objs, filePaths[1], [false, true, true]);
            checkState(objs, filePaths[2], [true, false, true]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.flushSync), () => {
        it("should queue files for delete then flush them", () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            wrapper.flushSync();

            checkState(objs, filePaths[0], [false, false, false]);
            checkState(objs, filePaths[1], [false, false, false]);
            checkState(objs, filePaths[2], [true, false, true]);
        });

        it("should maintain the files to delete when there's errors deleting them", () => {
            const objs = setup();
            const {wrapper, fileSystem} = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            fileSystem.deleteSync = (path: string) => { throw new Error(); };
            try {
                wrapper.flushSync();
            } catch {
                // do nothing
            }

            checkState(objs, filePaths[0], [false, true, true]);
            checkState(objs, filePaths[1], [false, true, true]);
            checkState(objs, filePaths[2], [true, false, true]);
        });

        it("should not error for queued files that don't exist", () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePaths = ["/file.ts", "/file2.ts"];
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            wrapper.flushSync();

            checkState(objs, filePaths[0], [false, false, false]);
            checkState(objs, filePaths[1], [false, false, false]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.flush), () => {
        it("should queue files for delete then flush them", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            await wrapper.flush();

            checkState(objs, filePaths[0], [false, false, false]);
            checkState(objs, filePaths[1], [false, false, false]);
            checkState(objs, filePaths[2], [true, false, true]);
        });

        it("should maintain the files to delete when there's errors deleting them", async () => {
            const objs = setup();
            const {wrapper, fileSystem} = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            fileSystem.delete = (path: string) => Promise.reject(new Error());
            try {
                await wrapper.flush();
            } catch {
                // do nothing
            }

            checkState(objs, filePaths[0], [false, true, true]);
            checkState(objs, filePaths[1], [false, true, true]);
            checkState(objs, filePaths[2], [true, false, true]);
        });

        it("should not error for queued files that don't exist", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePaths = ["/file.ts", "/file2.ts"];
            wrapper.queueDelete(filePaths[0]);
            wrapper.queueDelete(filePaths[1]);
            await wrapper.flush();

            checkState(objs, filePaths[0], [false, false, false]);
            checkState(objs, filePaths[1], [false, false, false]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.dequeueDelete), () => {
        it("should dequeue a file for delete", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            checkState(objs, filePath, [false, true, true]);
            wrapper.dequeueDelete(filePath);
            checkState(objs, filePath, [true, false, true]);
            await wrapper.flush();
            checkState(objs, filePath, [true, false, true]);
        });

        it("should dequeue the parent folder from deletion when the file is dequeued", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            wrapper.queueDelete(dirPath);
            checkState(objs, filePath, [false, true, true]);
            checkStateForDir(objs, dirPath, [false, true, true]);
            wrapper.dequeueDelete(filePath);
            checkState(objs, filePath, [true, false, true]);
            checkStateForDir(objs, dirPath, [true, false, true]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.deleteImmediately), () => {
        it("should delete a file immediately", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            await wrapper.deleteImmediately(filePath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should not error deleting a file that doesn't exist", async () => {
            const {wrapper, hashSet} = setup();
            let caughtErr: any;
            try {
                await wrapper.deleteImmediately("path.ts");
            } catch (err) {
                caughtErr = err;
            }
            expect(caughtErr).to.be.undefined;
            expect(ArrayUtils.from(hashSet.values())).to.deep.equal([], "should not have the path in the hashset");
        });

        it("should delete a file immediately after it was queued for delete", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            await wrapper.deleteImmediately(filePath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should delete a child file that was queued for delete when immediately deleting a parent dir", async () => {
            const objs = setup();
            const {wrapper, hashSet} = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            await wrapper.deleteImmediately(dirPath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should maintain the list of files to delete when there's an error deleting a directory", async () => {
            const objs = setup();
            const {wrapper, hashSet, fileSystem} = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            fileSystem.delete = (path: string) => Promise.reject(new Error());
            try {
                await wrapper.deleteImmediately(dirPath);
            } catch {
                // do nothing
            }
            checkState(objs, filePath, [false, true, true]);
            checkStateForDir(objs, dirPath, [false, true, true]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.deleteImmediatelySync), () => {
        it("should delete a file immediately", () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.deleteImmediatelySync(filePath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should not error deleting a file that doesn't exist", () => {
            const {wrapper, hashSet} = setup();
            expect(() => wrapper.deleteImmediatelySync("path.ts")).to.not.throw();
            expect(ArrayUtils.from(hashSet.values())).to.deep.equal([], "should not have the path in the hashset");
        });

        it("should delete a file immediately after it was queued for delete", () => {
            const objs = setup();
            const {wrapper} = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            wrapper.deleteImmediatelySync(filePath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should delete a child file that was queued for delete when immediately deleting a parent dir", () => {
            const objs = setup();
            const {wrapper, hashSet} = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            wrapper.deleteImmediatelySync(dirPath);
            checkState(objs, filePath, [false, false, false]);
        });

        it("should maintain the list of files to delete when there's an error deleting a directory", () => {
            const objs = setup();
            const {wrapper, hashSet, fileSystem} = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            fileSystem.deleteSync = (path: string) => { throw new Error(); };
            try {
                wrapper.deleteImmediatelySync(dirPath);
            } catch {
                // do nothing
            }
            checkState(objs, filePath, [false, true, true]);
            checkStateForDir(objs, dirPath, [false, true, true]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.fileExistsSync), () => {
        it("should not exist after queued for delete", () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
            wrapper.writeFileSync(filePath, "");
            expect(wrapper.fileExistsSync(filePath)).to.equal(true);
            wrapper.queueDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });

        it("should not exist after a dequeued for delete when originally existed", () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(filePath);
            wrapper.dequeueDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(true);
        });

        it("should not exist after a dequeued for delete when not originally existed", () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            wrapper.queueDelete(filePath);
            wrapper.dequeueDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });

        it("should not exist if the parent directory was queued for delete", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.mkdirSync(dirPath);
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDelete(dirPath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.directoryExistsSync), () => {
        it("should not exist after queued for delete", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
            wrapper.mkdirSync(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(true);
            wrapper.queueDelete(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
        });

        it("should not exist after a dequeued for delete when originally existed", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            wrapper.mkdirSync(dirPath);
            wrapper.queueDelete(dirPath);
            wrapper.dequeueDelete(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(true);
        });

        it("should not exist after a dequeued for delete when not originally existed", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            wrapper.queueDelete(dirPath);
            wrapper.dequeueDelete(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
        });

        it("should not exist if the parent directory was queued for delete", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            const subDirPath = "/dir/sub";
            wrapper.mkdirSync(dirPath);
            wrapper.mkdirSync(subDirPath);
            wrapper.queueDelete(dirPath);
            expect(wrapper.directoryExistsSync(subDirPath)).to.equal(false);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.directoryExists), () => {
        it("should not exist after queued for delete", async () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            expect(await wrapper.directoryExists(dirPath)).to.equal(false);
            wrapper.mkdirSync(dirPath);
            expect(await wrapper.directoryExists(dirPath)).to.equal(true);
            wrapper.queueDelete(dirPath);
            expect(await wrapper.directoryExists(dirPath)).to.equal(false);
            wrapper.flushSync();
            expect(await wrapper.directoryExists(dirPath)).to.equal(false);
        });

        it("should not exist after a dequeued for delete when originally existed", async () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            wrapper.mkdirSync(dirPath);
            wrapper.queueDelete(dirPath);
            wrapper.dequeueDelete(dirPath);
            expect(await wrapper.directoryExists(dirPath)).to.equal(true);
        });

        it("should not exist after a dequeued for delete when not originally existed", async () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            wrapper.queueDelete(dirPath);
            wrapper.dequeueDelete(dirPath);
            expect(await wrapper.directoryExists(dirPath)).to.equal(false);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.readFileSync), () => {
        it("should not read the file after it was deleted", () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(wrapper.readFileSync(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueDelete(filePath);
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.readDirSync), () => {
        it("should not read the dir after it was deleted", () => {
            const {wrapper} = setup();
            const dirPath = "/dir";
            const filePaths = ["/dir/file.ts", "/dir/file2.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            expect(wrapper.readDirSync(dirPath)).to.deep.equal(filePaths);
            wrapper.queueDelete(filePaths[0]);
            expect(wrapper.readDirSync(dirPath)).to.deep.equal([filePaths[1]]);
            wrapper.flushSync();
            expect(wrapper.readDirSync(dirPath)).to.deep.equal([filePaths[1]]);
            wrapper.queueDelete(dirPath);
            expect(() => wrapper.readDirSync(dirPath)).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readDirSync(dirPath)).to.throw(errors.DirectoryNotFoundError);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.glob), () => {
        it("should not read the dir after it was deleted", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            const dirGlob = "/dir/**/*.ts";
            const filePaths = ["/dir/file.ts", "/dir/file2.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            expect(wrapper.glob([dirGlob])).to.deep.equal(filePaths);
            wrapper.queueDelete(filePaths[0]);
            expect(wrapper.glob([dirGlob])).to.deep.equal([filePaths[1]]);
            wrapper.flushSync();
            expect(wrapper.glob([dirGlob])).to.deep.equal([filePaths[1]]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.readFileOrNotExistsSync), () => {
        it("should return false after it was deleted", () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueDelete(filePath);
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(false);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.readFileOrNotExists), () => {
        it("should return false after it was deleted", async () => {
            const {wrapper} = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueDelete(filePath);
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(false);
            wrapper.flushSync();
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(false);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.writeFileSync), () => {
        it("should undo the queued deletion when writing", () => {
            const {wrapper, hashSet} = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            wrapper.queueDelete(filePath);
            wrapper.writeFileSync(filePath, fileText);
            expect(hashSet.has(filePath)).to.be.false;
            expect(wrapper.fileExistsSync(filePath)).to.be.true;
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.writeFile), () => {
        it("should undo the queued deletion when writing", async () => {
            const {wrapper, hashSet} = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            await wrapper.writeFile(filePath, fileText);
            wrapper.queueDelete(filePath);
            await wrapper.writeFile(filePath, fileText);
            expect(hashSet.has(filePath)).to.be.false;
            expect(wrapper.fileExistsSync(filePath)).to.be.true;
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.mkdirSync), () => {
        it("should undo the queued deletion when making a directory", () => {
            const objs = setup();
            const {wrapper} = objs;
            const dirPath = "/dir";
            const subDirPath = "/dir/sub";
            wrapper.mkdirSync(dirPath);
            wrapper.mkdirSync(subDirPath);
            checkStateForDir(objs, dirPath, [true, false, true]);
            checkStateForDir(objs, subDirPath, [true, false, true]);
            wrapper.queueDelete(dirPath);
            wrapper.queueDelete(subDirPath);
            checkStateForDir(objs, dirPath, [false, true, true]);
            checkStateForDir(objs, subDirPath, [false, true, true]);
            wrapper.mkdirSync(subDirPath);
            checkStateForDir(objs, dirPath, [true, false, true]);
            checkStateForDir(objs, subDirPath, [true, false, true]);
        });
    });

    describe(nameof<FileSystemWrapper>(w => w.mkdir), () => {
        it("should undo the queued deletion when making a directory", async () => {
            const objs = setup();
            const {wrapper} = objs;
            const dirPath = "/dir";
            const subDirPath = "/dir/sub";
            await wrapper.mkdir(dirPath);
            await wrapper.mkdir(subDirPath);
            checkStateForDir(objs, dirPath, [true, false, true]);
            checkStateForDir(objs, subDirPath, [true, false, true]);
            wrapper.queueDelete(dirPath);
            wrapper.queueDelete(subDirPath);
            checkStateForDir(objs, dirPath, [false, true, true]);
            checkStateForDir(objs, subDirPath, [false, true, true]);
            await wrapper.mkdir(subDirPath);
            checkStateForDir(objs, dirPath, [true, false, true]);
            checkStateForDir(objs, subDirPath, [true, false, true]);
        });
    });
});
