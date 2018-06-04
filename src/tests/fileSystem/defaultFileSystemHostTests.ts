import { expect } from "chai";
import * as errors from "../../errors";
import { DefaultFileSystemHost } from "../../fileSystem";

describe(nameof(DefaultFileSystemHost), () => {
    describe(nameof<DefaultFileSystemHost>(h => h.readDirSync), () => {
        it("should throw a directory not found exception when reading a directory that doesn't exist", () => {
            expect(() => new DefaultFileSystemHost().readDirSync("testing/this/random/dir/out")).to.throw(errors.DirectoryNotFoundError);
        });
    });

    describe(nameof<DefaultFileSystemHost>(h => h.readFileSync), () => {
        it("should throw a file not found exception when reading a file that doesn't exist", () => {
            expect(() => new DefaultFileSystemHost().readFileSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<DefaultFileSystemHost>(h => h.readFile), () => {
        it("should throw a file not found exception when reading a file that doesn't exist", async () => {
            let caughtErr: any;
            try {
                await new DefaultFileSystemHost().readFile("testing/this/random/dir/out.ts");
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });

    describe(nameof<DefaultFileSystemHost>(h => h.deleteSync), () => {
        it("should not throw a file not found exception when deleting a path that doesn't exist", () => {
            expect(() => new DefaultFileSystemHost().deleteSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<DefaultFileSystemHost>(h => h.delete), () => {
        it("should not throw a file not found exception when deleting a path that doesn't exist", async () => {
            let caughtErr: any;
            try {
                await new DefaultFileSystemHost().delete("testing/this/random/dir/out.ts");
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });
});
