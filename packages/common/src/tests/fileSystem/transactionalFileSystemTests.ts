import { expect } from "chai";
import { errors } from "../../errors";
import { TransactionalFileSystem, InMemoryFileSystemHost } from "../../fileSystem";

describe(nameof(TransactionalFileSystem), () => {
    interface SetupObjects {
        fileSystem: InMemoryFileSystemHost;
        wrapper: TransactionalFileSystem;
    }

    function setup(): SetupObjects {
        const fileSystem = new InMemoryFileSystemHost();
        return { fileSystem, wrapper: new TransactionalFileSystem(fileSystem) };
    }

    function checkState(objs: SetupObjects, filePath: string, state: [boolean, boolean]) {
        expect(objs.wrapper.fileExistsSync(filePath)).to.equal(state[0], "wrapper");
        expect(objs.fileSystem.fileExistsSync(filePath)).to.equal(state[1], "file system");
    }

    function checkStateForDir(objs: SetupObjects, dirPath: string, state: [boolean, boolean]) {
        expect(objs.wrapper.directoryExistsSync(dirPath)).to.equal(state[0], "wrapper");
        expect(objs.fileSystem.directoryExistsSync(dirPath)).to.equal(state[1], "file system");
    }

    describe(nameof<TransactionalFileSystem>(w => w.queueFileDelete), () => {
        it("should queue a file for delete", () => {
            const objs = setup();
            const { wrapper } = objs;
            const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            wrapper.queueFileDelete(filePaths[0]);
            wrapper.queueFileDelete(filePaths[1]);

            checkState(objs, filePaths[0], [false, true]);
            checkState(objs, filePaths[1], [false, true]);
            checkState(objs, filePaths[2], [true, true]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.removeFileDelete), () => {
        it("should remove a file from being deleted", async () => {
            const objs = setup();
            const { wrapper } = objs;
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueFileDelete(filePath);
            checkState(objs, filePath, [false, true]);
            wrapper.removeFileDelete(filePath);
            checkState(objs, filePath, [true, true]);
            await wrapper.flush();
            checkState(objs, filePath, [true, true]);
        });

        it("should not dequeue the parent folder from deletion when the file is dequeued", () => {
            const objs = setup();
            const { wrapper } = objs;
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            const filePath2 = "/dir/file2.ts";

            wrapper.writeFileSync(filePath, "");
            wrapper.writeFileSync(filePath2, "");
            wrapper.queueFileDelete(filePath);
            wrapper.queueDirectoryDelete(dirPath);

            checkState(objs, filePath, [false, true]);
            checkState(objs, filePath2, [false, true]);
            checkStateForDir(objs, dirPath, [false, true]);

            wrapper.removeFileDelete(filePath);

            checkState(objs, filePath, [false, true]);
            checkStateForDir(objs, dirPath, [false, true]);
            checkState(objs, filePath2, [false, true]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.queueDirectoryDelete), () => {
        it("should queue a directory for delete", () => {
            const objs = setup();
            const { wrapper } = objs;
            wrapper.queueMkdir("/dir");
            wrapper.flushSync();
            wrapper.queueDirectoryDelete("/dir");

            checkStateForDir(objs, "/dir", [false, true]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.queueMoveDirectory), () => {
        it("should queue a directory for moving", () => {
            const objs = setup();
            const { wrapper } = objs;
            wrapper.queueMkdir("/dir");
            wrapper.flushSync();
            wrapper.queueMoveDirectory("/dir", "/dir2");

            checkStateForDir(objs, "/dir", [false, true]);
            checkStateForDir(objs, "/dir2", [true, false]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.queueCopyDirectory), () => {
        it("should queue a directory for copying", () => {
            const objs = setup();
            const { wrapper } = objs;
            wrapper.writeFileSync("/dir/file.ts", "");
            wrapper.flushSync();
            wrapper.queueCopyDirectory("/dir", "/dir2");

            checkStateForDir(objs, "/dir", [true, true]);
            checkStateForDir(objs, "/dir2", [true, false]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.queueMkdir), () => {
        it("should queue a directory for being made", () => {
            const objs = setup();
            const { wrapper } = objs;
            wrapper.queueMkdir("/dir");
            wrapper.getFileSystem().mkdirSync("/asdf");

            checkStateForDir(objs, "/dir", [true, false]);
            expect(wrapper.getDirectories("/")).to.deep.equal(["/asdf", "/dir"]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.flush), () => {
        function doTests(flush: (wrapper: TransactionalFileSystem, runChecks: () => void) => void) {
            it("should queue files for delete then flush them", () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePaths = ["/file.ts", "/file2.ts", "/file3.ts"];
                for (const filePath of filePaths)
                    wrapper.writeFileSync(filePath, "");
                wrapper.queueFileDelete(filePaths[0]);
                wrapper.queueFileDelete(filePaths[1]);

                flush(wrapper, () => {
                    checkState(objs, filePaths[0], [false, false]);
                    checkState(objs, filePaths[1], [false, false]);
                    checkState(objs, filePaths[2], [true, true]);
                });
            });

            it("should not error for queued files that don't exist", () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePaths = ["/file.ts", "/file2.ts"];
                wrapper.queueFileDelete(filePaths[0]);
                wrapper.queueFileDelete(filePaths[1]);

                flush(wrapper, () => {
                    checkState(objs, filePaths[0], [false, false]);
                    checkState(objs, filePaths[1], [false, false]);
                });
            });

            it("should move directories that were moved", () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePaths = ["/dir/file.ts", "/dir/file2.ts", "/dir/file3.ts", "/dir2/file4.ts", "/dir2/file5.ts"];
                for (const filePath of filePaths)
                    wrapper.writeFileSync(filePath, "");
                wrapper.queueMoveDirectory("/dir", "/newDir");
                wrapper.queueMoveDirectory("/dir2", "/dir3");
                wrapper.queueFileDelete("/dir3/file4.ts");
                wrapper.queueMkdir("/dir3/dir4");
                wrapper.queueMoveDirectory("/dir3", "/newDir");

                flush(wrapper, () => {
                    checkStateForDir(objs, "/dir", [false, false]);
                    checkStateForDir(objs, "/dir2", [false, false]);
                    checkStateForDir(objs, "/dir3", [false, false]);
                    checkStateForDir(objs, "/newDir", [true, true]);
                    checkStateForDir(objs, "/newDir/dir4", [true, true]);
                    checkState(objs, "/newDir/file.ts", [true, true]);
                    checkState(objs, "/newDir/file2.ts", [true, true]);
                    checkState(objs, "/newDir/file3.ts", [true, true]);
                    checkState(objs, "/newDir/file4.ts", [false, false]);
                    checkState(objs, "/newDir/file5.ts", [true, true]);
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, runChecks) => {
                await wrapper.flush();
                runChecks();
            });
        });

        describe("sync", () => {
            doTests((wrapper, runChecks) => {
                wrapper.flushSync();
                runChecks();
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.moveFileImmediately), () => {
        function doTests(moveFile: (wrapper: TransactionalFileSystem, fileFrom: string, fileTo: string, text: string, runChecks: (error?: any) => void) => void) {
            it("should move a file immediately to a new directory", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/file.ts", "text");
                moveFile(wrapper, "/file.ts", "/newDir/newFile.ts", "newText", err => {
                    expect(err).to.be.undefined;
                    checkState(objs, "/file.ts", [false, false]);
                    checkStateForDir(objs, "/newDir", [true, true]);
                    checkState(objs, "/newDir/newFile.ts", [true, true]);
                    expect(wrapper.readFileSync("/newDir/newFile.ts", "utf-8")).to.equal("newText");
                });
            });

            it("should throw when moving a file in a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.queueMoveDirectory("/dir", "/dir2");
                moveFile(wrapper, "/dir2/file.ts", "/dir2/newFile.ts", "newText", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw when moving a file in a directory with external copy operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.queueCopyDirectory("/dir", "/dir2");
                moveFile(wrapper, "/dir2/file.ts", "/dir2/newFile.ts", "newText", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw when moving a file to a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.writeFileSync("/dir2/file.ts", "text");
                wrapper.queueMoveDirectory("/dir2", "/dir3");
                moveFile(wrapper, "/dir/file.ts", "/dir3/newFile.ts", "newText", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, fileFrom, fileTo, text, runChecks) => {
                try {
                    await wrapper.moveFileImmediately(fileFrom, fileTo, text);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });

        describe("sync", () => {
            doTests((wrapper, fileFrom, fileTo, text, runChecks) => {
                try {
                    wrapper.moveFileImmediatelySync(fileFrom, fileTo, text);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.deleteFileImmediately), () => {
        function doTests(deleteFile: (wrapper: TransactionalFileSystem, filePath: string, runChecks: (error?: any) => void) => void) {
            it("should delete a file immediately", async () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePath = "/file.ts";
                wrapper.writeFileSync(filePath, "");
                deleteFile(wrapper, filePath, err => {
                    expect(err).to.be.undefined;
                    checkState(objs, filePath, [false, false]);
                });
            });

            it("should not error deleting a file that doesn't exist", async () => {
                const { wrapper } = setup();
                deleteFile(wrapper, "path.ts", err => {
                    expect(err).to.be.undefined;
                });
            });

            it("should be able to delete a file immediately after it was queued for delete", async () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePath = "/file.ts";
                wrapper.writeFileSync(filePath, "");
                wrapper.queueFileDelete(filePath);
                deleteFile(wrapper, filePath, err => {
                    expect(err).to.be.undefined;
                    checkState(objs, filePath, [false, false]);
                });
            });

            it("should throw when deleting a file in a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.queueMoveDirectory("/dir", "/dir2");
                deleteFile(wrapper, "/dir2/file.ts", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, filePath, runChecks) => {
                let thrownErr: any;
                try {
                    await wrapper.deleteFileImmediately(filePath);
                } catch (err) {
                    thrownErr = err;
                }
                runChecks(thrownErr);
            });
        });

        describe("sync", () => {
            doTests((wrapper, filePath, runChecks) => {
                let thrownErr: any;
                try {
                    wrapper.deleteFileImmediatelySync(filePath);
                } catch (err) {
                    thrownErr = err;
                }
                runChecks(thrownErr);
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.copyDirectoryImmediately), () => {
        function doTests(copyDirectory: (wrapper: TransactionalFileSystem, fileFrom: string, fileTo: string, runChecks: (error?: any) => void) => void) {
            it("should copy a directory immediately to a new directory", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                copyDirectory(wrapper, "/dir", "/newDir", err => {
                    expect(err).to.be.undefined;
                    checkStateForDir(objs, "/dir", [true, true]);
                    checkState(objs, "/dir/file.ts", [true, true]);
                    checkStateForDir(objs, "/newDir", [true, true]);
                    checkState(objs, "/newDir/file.ts", [true, true]);
                });
            });

            it("should throw when copying a directory in a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.queueMoveDirectory("/dir", "/dir2");
                copyDirectory(wrapper, "/dir2", "/dir3", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw when copyin a directory to a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.writeFileSync("/dir2/file2.ts", "text");
                wrapper.queueMoveDirectory("/dir2", "/dir3");
                copyDirectory(wrapper, "/dir", "/dir3", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, dirFrom, dirTo, runChecks) => {
                let thrownErr: any;
                try {
                    await wrapper.copyDirectoryImmediately(dirFrom, dirTo);
                } catch (err) {
                    thrownErr = err;
                }
                runChecks(thrownErr);
            });
        });

        describe("sync", () => {
            doTests((wrapper, dirFrom, dirTo, runChecks) => {
                let thrownErr: any;
                try {
                    wrapper.copyDirectoryImmediatelySync(dirFrom, dirTo);
                } catch (err) {
                    thrownErr = err;
                }
                runChecks(thrownErr);
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.moveDirectoryImmediately), () => {
        function doTests(moveDirectory: (wrapper: TransactionalFileSystem, fileFrom: string, fileTo: string, runChecks: (error?: any) => void) => void) {
            it("should move a directory immediately to a new directory", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                moveDirectory(wrapper, "/dir", "/newDir", err => {
                    expect(err).to.be.undefined;
                    checkStateForDir(objs, "/dir", [false, false]);
                    checkStateForDir(objs, "/newDir", [true, true]);
                    checkState(objs, "/newDir/file.ts", [true, true]);
                });
            });

            it("should throw when moving a directory in a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.queueMoveDirectory("/dir", "/dir2");
                moveDirectory(wrapper, "/dir2", "/dir3", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw when moving a directory to a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/file.ts", "text");
                wrapper.writeFileSync("/dir2/file2.ts", "text");
                wrapper.queueMoveDirectory("/dir2", "/dir3");
                moveDirectory(wrapper, "/dir", "/dir3", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, dirFrom, dirTo, runChecks) => {
                try {
                    await wrapper.moveDirectoryImmediately(dirFrom, dirTo);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });

        describe("sync", () => {
            doTests((wrapper, dirFrom, dirTo, runChecks) => {
                try {
                    wrapper.moveDirectoryImmediatelySync(dirFrom, dirTo);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.deleteDirectoryImmediately), () => {
        function doTests(deleteDir: (wrapper: TransactionalFileSystem, dirPath: string, runChecks: (error?: any) => void) => void) {
            it("should delete a child file that was queued for delete when immediately deleting a parent dir", () => {
                const objs = setup();
                const { wrapper } = objs;
                const dirPath = "/dir";
                const filePath = "/dir/file.ts";
                wrapper.writeFileSync(filePath, "");
                wrapper.queueFileDelete(filePath);
                deleteDir(wrapper, dirPath, err => {
                    expect(err).to.be.undefined;
                    checkStateForDir(objs, dirPath, [false, false]);
                    checkState(objs, filePath, [false, false]);
                });
            });

            it("should maintain the list of files to delete when there's an error deleting a directory", () => {
                const objs = setup();
                const { wrapper, fileSystem } = objs;
                const dirPath = "/dir";
                const filePath = "/dir/file.ts";
                wrapper.writeFileSync(filePath, "");
                wrapper.queueFileDelete(filePath);
                fileSystem.deleteSync = (path: string) => {
                    throw new Error();
                };
                deleteDir(wrapper, dirPath, err => {
                    expect(err).to.be.instanceof(Error);
                    checkStateForDir(objs, dirPath, [false, true]);
                    checkState(objs, filePath, [false, true]);
                });
            });

            it("should throw when deleting a directory in a directory with external operations", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/subDir/file.ts", "text");
                wrapper.queueMoveDirectory("/dir", "/dir2");
                deleteDir(wrapper, "/dir2/subDir", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw when deleting a directory in a directory whose parent was once marked for deletion", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/subDir/file.ts", "text");
                wrapper.queueDirectoryDelete("/dir");
                wrapper.removeFileDelete("/dir/subDir/file.ts");
                deleteDir(wrapper, "/dir/subDir", err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should not throw when deleting a directory that contains queued moves that are internal", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/subDir/file.ts", "");
                wrapper.writeFileSync("/dir/subDir2/file.ts", "");
                wrapper.queueMoveDirectory("/dir/subDir", "/dir/newDir");
                wrapper.queueMoveDirectory("/dir/subDir2", "/dir/newDir/subSub");
                deleteDir(wrapper, "/dir", err => {
                    expect(err).to.be.undefined;
                });
            });

            it("should not throw when deleting a directory that contains queued deletes that are internal", () => {
                const objs = setup();
                const { wrapper } = objs;
                wrapper.writeFileSync("/dir/subDir/file.ts", "");
                wrapper.writeFileSync("/dir/subDir2/file.ts", "");
                wrapper.queueDirectoryDelete("/dir/subDir");
                wrapper.queueFileDelete("/dir/subDir2/file.ts");
                deleteDir(wrapper, "/dir", err => {
                    expect(err).to.be.undefined;
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, filePath, runChecks) => {
                try {
                    await wrapper.deleteDirectoryImmediately(filePath);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });

        describe("sync", () => {
            doTests((wrapper, filePath, runChecks) => {
                try {
                    wrapper.deleteDirectoryImmediatelySync(filePath);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.fileExistsSync), () => {
        it("should not exist after queued for delete", () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
            wrapper.writeFileSync(filePath, "");
            expect(wrapper.fileExistsSync(filePath)).to.equal(true);
            wrapper.queueFileDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });

        it("should not exist after a dequeued for delete when originally existed", () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueFileDelete(filePath);
            wrapper.removeFileDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(true);
        });

        it("should not exist after a dequeued for delete when not originally existed", () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            wrapper.queueFileDelete(filePath);
            wrapper.removeFileDelete(filePath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });

        it("should not exist if the parent directory was queued for delete", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            const filePath = "/dir/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDirectoryDelete(dirPath);
            expect(wrapper.fileExistsSync(filePath)).to.equal(false);
        });

        it("should not exist after its parent directory moved", () => {
            const objs = setup();
            const { wrapper } = objs;
            const filePath = "/dir/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.queueMoveDirectory("/dir", "/dir2");
            checkState(objs, filePath, [false, true]);
        });

        it("should not exist after its parent directory was once moved", () => {
            const objs = setup();
            const { wrapper } = objs;
            const filePath = "/dir/file.ts";
            const filePath2 = "/dir/sub/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.writeFileSync(filePath2, "");
            wrapper.queueMoveDirectory("/dir", "/dir2");
            wrapper.queueMkdir("/dir");
            wrapper.queueMkdir("/dir/sub");
            checkState(objs, filePath, [false, true]);
            checkState(objs, filePath2, [false, true]);
        });

        it("should not exist after its parent directory was once removed", () => {
            const objs = setup();
            const { wrapper } = objs;
            const filePath = "/dir/file.ts";
            const filePath2 = "/dir/sub/file.ts";
            wrapper.writeFileSync(filePath, "");
            wrapper.writeFileSync(filePath2, "");
            wrapper.queueDirectoryDelete("/dir");
            wrapper.queueMkdir("/dir");
            wrapper.queueMkdir("/dir/sub");
            checkState(objs, filePath, [false, true]);
            checkState(objs, filePath2, [false, true]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.directoryExistsSync), () => {
        it("should not exist after queued for delete", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
            wrapper.queueMkdir(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(true);
            wrapper.queueDirectoryDelete(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(false);
        });

        it("should exist after a queued for mkdir", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            wrapper.writeFileSync(dirPath + "/file.ts", "");
            wrapper.queueDirectoryDelete(dirPath);
            wrapper.queueMkdir(dirPath);
            expect(wrapper.directoryExistsSync(dirPath)).to.equal(true);
        });

        it("should not exist if the parent directory was queued for delete", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            const subDirPath = "/dir/sub";
            wrapper.writeFileSync(subDirPath + "/file.ts", "");
            wrapper.queueDirectoryDelete(dirPath);
            expect(wrapper.directoryExistsSync(subDirPath)).to.equal(false);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.readFileSync), () => {
        it("should not read the file after it was deleted", () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(wrapper.readFileSync(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueFileDelete(filePath);
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.FileNotFoundError);
        });

        it("should not read the file after its parent was once deleted", () => {
            const { wrapper } = setup();
            const filePath = "/dir/sub/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            wrapper.queueDirectoryDelete("/dir");
            wrapper.queueMkdir("/dir/sub");
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readFileSync(filePath, "utf-8")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.readDirSync), () => {
        it("should not read the dir after it was deleted", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            const filePaths = ["/dir/file.ts", "/dir/file2.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            expect(wrapper.readDirSync(dirPath)).to.deep.equal(filePaths);
            wrapper.queueFileDelete(filePaths[0]);
            expect(wrapper.readDirSync(dirPath)).to.deep.equal([filePaths[1]]);
            wrapper.flushSync();
            expect(wrapper.readDirSync(dirPath)).to.deep.equal([filePaths[1]]);
            wrapper.queueDirectoryDelete(dirPath);
            expect(() => wrapper.readDirSync(dirPath)).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readDirSync(dirPath)).to.throw(errors.DirectoryNotFoundError);
        });

        it("should not read a directory after its parent was once deleted", () => {
            const { wrapper } = setup();
            const dirPath = "/dir/sub";
            const filePath = `${dirPath}/file.ts`;
            wrapper.writeFileSync(filePath, "");
            wrapper.queueDirectoryDelete("/dir");
            wrapper.queueMkdir(dirPath);
            expect(() => wrapper.readDirSync(dirPath)).to.throw(errors.InvalidOperationError);
            wrapper.flushSync();
            expect(() => wrapper.readDirSync(dirPath)).to.not.throw();
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.globSync), () => {
        it("should not read the dir after it was deleted", () => {
            const { wrapper } = setup();
            const dirPath = "/dir";
            const dirGlob = "/dir/**/*.ts";
            const filePaths = ["/dir/file.ts", "/dir/file2.ts"];
            for (const filePath of filePaths)
                wrapper.writeFileSync(filePath, "");
            expect(wrapper.globSync([dirGlob])).to.deep.equal(filePaths);
            wrapper.queueFileDelete(filePaths[0]);
            expect(wrapper.globSync([dirGlob])).to.deep.equal([filePaths[1]]);
            wrapper.flushSync();
            expect(wrapper.globSync([dirGlob])).to.deep.equal([filePaths[1]]);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.readFileOrNotExistsSync), () => {
        it("should return false after it was deleted", () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueFileDelete(filePath);
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(false);
            wrapper.flushSync();
            expect(wrapper.readFileOrNotExistsSync(filePath, "utf-8")).to.equal(false);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.readFileOrNotExists), () => {
        it("should return false after it was deleted", async () => {
            const { wrapper } = setup();
            const filePath = "/file.ts";
            const fileText = "test";
            wrapper.writeFileSync(filePath, fileText);
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(fileText);
            wrapper.queueFileDelete(filePath);
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(false);
            wrapper.flushSync();
            expect(await wrapper.readFileOrNotExists(filePath, "utf-8")).to.equal(false);
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.writeFile), () => {
        function doTests(writeFile: (wrapper: TransactionalFileSystem, filePath: string, text: string, runChecks: (error?: any) => void) => void) {
            it("should undo the queued deletion when writing", () => {
                const objs = setup();
                const { wrapper } = objs;
                const filePath = "/file.ts";
                const fileText = "test";
                writeFile(wrapper, filePath, fileText, () => {
                    wrapper.queueFileDelete(filePath);
                    writeFile(wrapper, filePath, fileText, err => {
                        expect(err).to.be.undefined;
                        checkState(objs, filePath, [true, true]);
                    });
                });
            });
        }

        describe("async", () => {
            doTests(async (wrapper, filePath, text, runChecks) => {
                try {
                    await wrapper.writeFile(filePath, text);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });

        describe("sync", () => {
            doTests((wrapper, filePath, text, runChecks) => {
                try {
                    wrapper.writeFileSync(filePath, text);
                    runChecks();
                } catch (err) {
                    runChecks(err);
                }
            });
        });
    });

    describe(nameof<TransactionalFileSystem>(w => w.getStandardizedAbsolutePath), () => {
        it("should use the casing provided for case sensitive file systems", () => {
            const fileSystem = new InMemoryFileSystemHost();
            const wrapper = new TransactionalFileSystem(fileSystem);
            expect(wrapper.getStandardizedAbsolutePath("test.ts")).to.equal("/test.ts");
            expect(wrapper.getStandardizedAbsolutePath("tesT.ts")).to.equal("/tesT.ts");
        });

        it("should use the first casing found for case insensitive file systems", async () => {
            const fileSystem = new InMemoryFileSystemHost();
            fileSystem.isCaseSensitive = () => false;
            const wrapper = new TransactionalFileSystem(fileSystem);
            expect(wrapper.getStandardizedAbsolutePath("test.ts")).to.equal("/test.ts");
            expect(wrapper.getStandardizedAbsolutePath("tesT.ts")).to.equal("/test.ts");
        });

        it("should use the first casing found for case insensitive file systems", async () => {
            const fileSystem = new InMemoryFileSystemHost();
            fileSystem.isCaseSensitive = () => false;
            const wrapper = new TransactionalFileSystem(fileSystem);

            expect(wrapper.getStandardizedAbsolutePath("RANDOM")).to.equal("/RANDOM");
            expect(wrapper.getStandardizedAbsolutePath("randoM.ts")).to.equal("/randoM.ts");

            // ensure these scenarios will remove the stored standardized path
            wrapper.queueFileDelete("test.ts");
            expect(wrapper.getStandardizedAbsolutePath("Test.ts")).to.equal("/Test.ts");

            expect(wrapper.getStandardizedAbsolutePath("tesT.ts")).to.equal("/Test.ts");
            wrapper.deleteFileImmediatelySync("Test.ts");
            expect(wrapper.getStandardizedAbsolutePath("tesT.ts")).to.equal("/tesT.ts");

            expect(wrapper.getStandardizedAbsolutePath("TesT.ts")).to.equal("/tesT.ts");
            await wrapper.deleteFileImmediately("test.ts");
            expect(wrapper.getStandardizedAbsolutePath("TesT.ts")).to.equal("/TesT.ts");

            expect(wrapper.getStandardizedAbsolutePath("TesT")).to.equal("/TesT");
            expect(wrapper.getStandardizedAbsolutePath("TEst")).to.equal("/TesT");
            await wrapper.moveDirectoryImmediately("test", "other");
            expect(wrapper.getStandardizedAbsolutePath("TEst")).to.equal("/TEst");

            expect(wrapper.getStandardizedAbsolutePath("teSt")).to.equal("/TEst");
            await wrapper.deleteDirectoryImmediately("test");
            expect(wrapper.getStandardizedAbsolutePath("teSt")).to.equal("/teSt");

            expect(wrapper.getStandardizedAbsolutePath("TeSt")).to.equal("/teSt");
            await wrapper.deleteDirectoryImmediatelySync("test");
            expect(wrapper.getStandardizedAbsolutePath("TeSt")).to.equal("/TeSt");

            expect(wrapper.getStandardizedAbsolutePath("TeST")).to.equal("/TeSt");
            wrapper.queueDirectoryDelete("test");
            expect(wrapper.getStandardizedAbsolutePath("tesT")).to.equal("/tesT");

            expect(wrapper.getStandardizedAbsolutePath("tEST")).to.equal("/tesT");
            wrapper.queueMoveDirectory("test", "other");
            expect(wrapper.getStandardizedAbsolutePath("TEST")).to.equal("/TEST");

            // should have never forgotten these ones
            expect(wrapper.getStandardizedAbsolutePath("RANDOM")).to.equal("/RANDOM");
            expect(wrapper.getStandardizedAbsolutePath("randoM.ts")).to.equal("/randoM.ts");
        });
    });
});
