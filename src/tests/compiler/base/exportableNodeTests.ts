import {expect} from "chai";
import {ExportableNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportableNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("export var exportedVar = 1;\nvar myExplicitVar: string;\nexport default class Identifier {}\n");
    const statements = mainSourceFile.getVariableStatements();
    const exportedStatement = statements[0];
    const notExportedStatement = statements[1];
    const exportedDefaultClass = mainSourceFile.getClassDeclarations()[0];

    describe(nameof<ExportableNode>(n => n.hasExportKeyword), () => {
        it("should have an export keyword when exported", () => {
            expect(exportedStatement.hasExportKeyword()).to.be.true;
        });

        it("should not have an export keyword when not exported", () => {
            expect(notExportedStatement.hasExportKeyword()).to.be.false;
        });
    });

    describe(nameof<ExportableNode>(n => n.getExportKeyword), () => {
        it("should have an export keyword when exported", () => {
            expect(exportedStatement.getExportKeyword()!.getText()).to.equal("export");
        });

        it("should not have an export keyword when not exported", () => {
            expect(notExportedStatement.getExportKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ExportableNode>(n => n.hasDefaultKeyword), () => {
        it("should have a default keyword when default exported", () => {
            expect(exportedDefaultClass.hasDefaultKeyword()).to.be.true;
        });

        describe("not exported node", () => {
            it("should not have a default keyword when not default exported", () => {
                expect(exportedStatement.hasDefaultKeyword()).to.be.false;
            });
        });
    });

    describe(nameof<ExportableNode>(n => n.getDefaultKeyword), () => {
        it("should have a default keyword when default exported", () => {
            expect(exportedDefaultClass.getDefaultKeyword()!.getText()).to.equal("default");
        });

        it("should not have an export keyword when not default exported", () => {
            expect(exportedStatement.getDefaultKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ExportableNode>(n => n.isDefaultExport), () => {
        it("should be the default export when default exported on a different line", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default Identifier;");
            expect(firstChild.isDefaultExport()).to.be.true;
        });

        it("should be the default export when default exported on the same line", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
            expect(firstChild.isDefaultExport()).to.be.true;
        });

        it("should not be a default export when not", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.isDefaultExport()).to.be.false;
        });

        it("should not be a default export when not and there exists another default export", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default class Identifier2 {}");
            expect(firstChild.isDefaultExport()).to.be.false;
        });
    });

    describe(nameof<ExportableNode>(n => n.setIsDefaultExport), () => {
        describe("setting as the default export", () => {
            it("should remove any existing default export and make the specified class the default export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default class Identifier2 {}");
                firstChild.setIsDefaultExport(true);
                expect(sourceFile.getText()).to.equal("export default class Identifier {}\nclass Identifier2 {}");
            });

            it("should do nothing if already the default export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
                firstChild.setIsDefaultExport(true);
                expect(sourceFile.getText()).to.equal("export default class Identifier {}");
            });

            it("should add default if already an export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
                firstChild.setIsDefaultExport(true);
                expect(sourceFile.getText()).to.equal("export default class Identifier {}");
            });
        });

        describe("unsetting as the default export", () => {
            it("should remove the default export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
                firstChild.setIsDefaultExport(false);
                expect(sourceFile.getText()).to.equal("class Identifier {}");
            });

            it("should do nothing if already not the default export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}\nexport default class Identifier2 {}");
                firstChild.setIsDefaultExport(false);
                expect(sourceFile.getText()).to.equal("export class Identifier {}\nexport default class Identifier2 {}");
            });
        });
    });
});
