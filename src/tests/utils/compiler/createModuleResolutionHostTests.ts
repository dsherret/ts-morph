import { expect } from "chai";
import { VirtualFileSystemHost } from "../../../fileSystem";
import { createModuleResolutionHost } from "../../../utils/compiler/createModuleResolutionHost";

describe(nameof(createModuleResolutionHost), () => {
    function setup() {
        const fileSystem = new VirtualFileSystemHost();
        const moduleResolutionHost = createModuleResolutionHost(fileSystem);
        return {
            fileSystem,
            moduleResolutionHost
        };
    }

    it("should get if a directory exists", () => {
        const { moduleResolutionHost, fileSystem } = setup();
        fileSystem.mkdirSync("/dir");
        expect(moduleResolutionHost.directoryExists!("/dir")).to.be.true;
        expect(moduleResolutionHost.directoryExists!("/dir2")).to.be.false;
    });

    it("should get if a file exists", () => {
        const { moduleResolutionHost, fileSystem } = setup();
        fileSystem.writeFileSync("/file.ts", "");
        expect(moduleResolutionHost.fileExists!("/file.ts")).to.be.true;
        expect(moduleResolutionHost.fileExists!("/file2.ts")).to.be.false;
    });

    it("should read the contents of a file when it exists", () => {
        const { moduleResolutionHost, fileSystem } = setup();
        const contents = "test";
        fileSystem.writeFileSync("/file.ts", contents);
        expect(moduleResolutionHost.readFile!("/file.ts")).to.equal(contents);
    });

    it("should return undefined when reading a file that doesn't exist", () => {
        const { moduleResolutionHost } = setup();
        expect(moduleResolutionHost.readFile!("/file.ts")).to.be.undefined;
    });

    it("should get the current directory", () => {
        const { moduleResolutionHost } = setup();
        expect(moduleResolutionHost.getCurrentDirectory!()).to.equal("/");
    });

    it("should read the directories in a folder", () => {
        const { moduleResolutionHost, fileSystem } = setup();
        fileSystem.mkdirSync("/dir1");
        fileSystem.mkdirSync("/dir2");
        expect(moduleResolutionHost.getDirectories!("/")).to.deep.equal([
            "/dir1",
            "/dir2"
        ]);
    });

    it("should get the real path", () => {
        const { moduleResolutionHost, fileSystem } = setup();
        fileSystem.realpathSync = path => path + "_RealPath";
        expect(moduleResolutionHost.realpath!("test")).to.equal("test_RealPath");
    });

    it("should not have a trace function", () => {
        const { moduleResolutionHost } = setup();
        // This hasn't been implemented and I'm not sure it will be.
        // Looking at the compiler API code, it seems this writes to
        // stdout. Probably best to let people implement this themselves
        // if they want it.
        expect(moduleResolutionHost.trace).to.be.undefined;
    });
});
