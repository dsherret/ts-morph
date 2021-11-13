import { expect } from "chai";
import { errors } from "../../errors";
import { RealFileSystemHost } from "../../fileSystem";
import { nameof } from "../../utils";

describe("RealFileSystemHost", () => {
  describe(nameof<RealFileSystemHost>("readDirSync"), () => {
    it("should throw a directory not found exception when reading a directory that doesn't exist", () => {
      expect(() => new RealFileSystemHost().readDirSync("testing/this/random/dir/out")).to.throw(errors.DirectoryNotFoundError);
    });
  });

  describe(nameof<RealFileSystemHost>("readFileSync"), () => {
    it("should throw a file not found exception when reading a file that doesn't exist", () => {
      expect(() => new RealFileSystemHost().readFileSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
    });
  });

  describe(nameof<RealFileSystemHost>("readFile"), () => {
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

  describe(nameof<RealFileSystemHost>("deleteSync"), () => {
    it("should not throw a file not found exception when deleting a path that doesn't exist", () => {
      expect(() => new RealFileSystemHost().deleteSync("testing/this/random/dir/out.ts")).to.throw(errors.FileNotFoundError);
    });
  });

  describe(nameof<RealFileSystemHost>("mkdir"), () => {
    it("should not throw for a directory that already exists", async () => {
      try {
        await new RealFileSystemHost().mkdir(__dirname);
      } catch (err) {
        expect.fail("Should not have thrown.");
      }
    });
  });

  describe(nameof<RealFileSystemHost>("mkdirSync"), () => {
    it("should not throw for a directory that already exists", async () => {
      expect(() => new RealFileSystemHost().mkdirSync(__dirname)).to.not.throw();
    });
  });

  describe(nameof<RealFileSystemHost>("delete"), () => {
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
