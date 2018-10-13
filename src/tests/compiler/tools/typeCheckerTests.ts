import { expect } from "chai";
import { TypeChecker } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypeChecker), () => {
    describe(nameof<TypeChecker>(p => p.getAmbientModules), () => {
        it("should get the ambient modules when they exist", () => {
            const { project } = getInfoFromText("");
            const fileSystem = project.getFileSystem();

            fileSystem.writeFileSync("/node_modules/@types/jquery/index.d.ts", `
    declare module 'jquery' {
        export = jQuery;
    }
    declare const jQuery: JQueryStatic;
    interface JQueryStatic {
        test: string;
    }`);
            fileSystem.writeFileSync("/node_modules/@types/jquery/package.json",
                `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`);

            const ambientModules = project.getTypeChecker().getAmbientModules();
            expect(ambientModules.length).to.equal(1);
            expect(ambientModules[0].getName()).to.equal(`"jquery"`);
        });

        it("should not have any when they don't exist", () => {
            const { project } = getInfoFromText("");
            expect(project.getTypeChecker().getAmbientModules().length).to.equal(0);
        });
    });
});
