import {expect} from "chai";
import {ExportableNode, ClassDeclaration, NamespaceDeclaration} from "./../../../compiler";
import * as errors from "./../../../errors";
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

    describe(nameof<ExportableNode>(n => n.isNamedExport), () => {
        it("should be a named export when one", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
            expect(firstChild.isNamedExport()).to.be.true;
        });

        it("should not be a named export when it's a default export", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
            expect(firstChild.isNamedExport()).to.be.false;
        });

        it("should not be a named export when contained in a namespace", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Namespace { export class Identifier {} }");
            const innerClass = firstChild.getClassDeclarations()[0];
            expect(innerClass.isNamedExport()).to.be.false;
        });

        it("should not be a named export when neither a default or named export", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.isNamedExport()).to.be.false;
        });
    });

    describe(nameof<ExportableNode>(n => n.setIsDefaultExport), () => {
        describe("setting as the default export", () => {
            it("should remove any existing default export and make the specified class the default export", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default class Identifier2 {}");
                firstChild.setIsDefaultExport(true);
                expect(sourceFile.getText()).to.equal("export default class Identifier {}\nclass Identifier2 {}");
            });

            it("should remove any existing default export and make the specified class the default export when using a default export statement", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nclass Identifier2 {}\nexport default Identifier2;");
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

            it("should throw an error if setting as a default export within a namespace", () => {
                const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { class Identifier {} }");
                const innerChild = firstChild.getClassDeclarations()[0];
                expect(() => innerChild.setIsDefaultExport(true)).to.throw(errors.InvalidOperationError);
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

    describe(nameof<ExportableNode>(n => n.setIsExported), () => {
        describe("setting as exported", () => {
            it("should do nothing if already exported", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
                firstChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("export class Identifier {}");
            });

            it("should add the export keyword if not exported", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
                firstChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("export class Identifier {}");
            });

            it("should do nothing if already exported from a namespace", () => {
                const {sourceFile, firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { export class Identifier {} }");
                const innerChild = firstChild.getClassDeclarations()[0];
                innerChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("namespace Identifier { export class Identifier {} }");
            });

            it("should add the export keyword if not exported from a namespace", () => {
                const {sourceFile, firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { class Identifier {} }");
                const innerChild = firstChild.getClassDeclarations()[0];
                innerChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("namespace Identifier { export class Identifier {} }");
            });

            it("should remove it as a default export if one", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
                firstChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("export class Identifier {}");
            });

            it("should remove it as a default export if one and exported in a separate statement", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default Identifier;");
                firstChild.setIsExported(true);
                expect(sourceFile.getText()).to.equal("export class Identifier {}");
            });
        });

        describe("setting as not exported", () => {
            it("should do nothing if already not exported", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
                firstChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("class Identifier {}");
            });

            it("should remove the export keyword if exported", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
                firstChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("class Identifier {}");
            });

            it("should do nothing if already not exported from a namespace", () => {
                const {sourceFile, firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { class Identifier {} }");
                const innerChild = firstChild.getClassDeclarations()[0];
                innerChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("namespace Identifier { class Identifier {} }");
            });

            it("should remove the export keyword if exported from a namespace", () => {
                const {sourceFile, firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { export class Identifier {} }");
                const innerChild = firstChild.getClassDeclarations()[0];
                innerChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("namespace Identifier { class Identifier {} }");
            });

            it("should remove it as a default export if one", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("export default class Identifier {}");
                firstChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("class Identifier {}");
            });

            it("should remove it as a default export if one and exported in a separate statement", () => {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}\nexport default Identifier;");
                firstChild.setIsExported(false);
                expect(sourceFile.getText()).to.equal("class Identifier {}");
            });
        });
    });
});
