import { expect } from "chai";
import { errors } from "../../errors";
import { RealFileSystemHost } from "../../fileSystem";

describe(nameof(RealFileSystemHost), () => {
    describe(nameof<RealFileSystemHost>(h => h.readDirSync), () => {
        it("should throw a directory not found exception when reading a directory that doesn't exist", () => {
            expect(() => new RealFileSystemHost().readDirSync("testing/this/random/dir/out")).to.throw(errors.DirectoryNotFoundError);
        });
    });

    describe(nameof<RealFileSystemHost>(h => h.readFileSync), () => {
        it("should throw a file not found exception when reading a file that doesn't exist", () => {
            expect(() => new RealFileSystemHost().readFileSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<RealFileSystemHost>(h => h.readFile), () => {
        it("should throw a file not found exception when reading a file that doesn't exist", async () => {
            let caughtErr: any;
            try {
                await new RealFileSystemHost().readFile("testing/this/random/dir/out.ts");
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });

    describe(nameof<RealFileSystemHost>(h => h.deleteSync), () => {
        it("should not throw a file not found exception when deleting a path that doesn't exist", () => {
            expect(() => new RealFileSystemHost().deleteSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<RealFileSystemHost>(h => h.delete), () => {
        it("should not throw a file not found exception when deleting a path that doesn't exist", async () => {
            let caughtErr: any;
            try {
                await new RealFileSystemHost().delete("testing/this/random/dir/out.ts");
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).to.be.instanceOf(errors.FileNotFoundError);
        });
    });
});
