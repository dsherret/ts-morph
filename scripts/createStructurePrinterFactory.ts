/**
 * Code Manipulation - Creates the StructurePrinterFactory
 * --------------------------------------------------------
 * Todo some description...
 * --------------------------------------------------------
 */
import {TypeGuards, SyntaxKind, MethodDeclarationStructure, ParameterDeclaration, Scope} from "../src/main";
import {TsSimpleAstInspector} from "./inspectors";

export function createStructurePrinterFactory(inspector: TsSimpleAstInspector) {
    const project = inspector.getProject();
    const sourceFile = project.getSourceFileOrThrow("StructurePrinterFactory.ts");
    sourceFile.removeText();

    // add imports
    sourceFile.addImportDeclaration({
        namespaceImport: "structurePrinters",
        moduleSpecifier: sourceFile.getRelativePathToSourceFileAsModuleSpecifier(project.getSourceFileOrThrow("src/structurePrinters/index.ts"))
    });
    sourceFile.addImportDeclaration({
        namedImports: ["SupportedFormatCodeSettings"],
        moduleSpecifier: sourceFile.getRelativePathToSourceFileAsModuleSpecifier(project.getSourceFileOrThrow("src/options/index.ts"))
    });
    sourceFile.addImportDeclaration({
        namedImports: ["GlobalContainer"],
        moduleSpecifier: sourceFile.getRelativePathToSourceFileAsModuleSpecifier(project.getSourceFileOrThrow("src/GlobalContainer.ts"))
    });

    sourceFile.addClass({
        isExported: true,
        name: "StructurePrinterFactory",
        ctor: {
            parameters: [{ isReadonly: true, scope: Scope.Private, name: "global", type: "GlobalContainer" }]
        },
        methods: [{
            scope: Scope.Private,
            name: "getFormatCodeSettings",
            returnType: "SupportedFormatCodeSettings",
            bodyText: "return this.global.getFormatCodeSettings();"
        }, ...getMethods()]
    });

    sourceFile.insertText(0, writer =>
        writer.writeLine("// DO NOT EDIT - Automatically maintained by createStructurePrinterFactory.ts"));

    function getMethods() {
        const structurePrinters = project.getSourceFileOrThrow("./src/structurePrinters/index.ts")
            .getExportedDeclarations()
            .filter(TypeGuards.isClassDeclaration)
            .filter(c => isAllowedStructurePrinter(c.getNameOrThrow()));
        const methods: MethodDeclarationStructure[] = [];

        for (const structurePrinter of structurePrinters) {
            const ctor = structurePrinter.getConstructors()[0];
            const ctorParams = ctor == null ? [] : ctor.getParameters();
            const name = structurePrinter.getNameOrThrow();
            methods.push({
                name: `for${name.replace(/StructurePrinter$/, "")}`,
                returnType: `structurePrinters.${name}`,
                bodyText: `return new structurePrinters.${name}(${ctorParams.map(ctorParamToArgument).join(", ")});`,
                parameters: ctorParams.filter(exposeCtorParam).map(p => ({
                    name: p.getNameOrThrow(),
                    type: p.getTypeNodeOrThrow().getText()
                }))
            });
        }

        return methods;

        function exposeCtorParam(ctorParam: ParameterDeclaration) {
            if (ctorParam.getTypeNodeOrThrow().getText() === "SupportedFormatCodeSettings")
                return false;
            return true;
        }

        function ctorParamToArgument(ctorParam: ParameterDeclaration) {
            if (ctorParam.getTypeNodeOrThrow().getText() === "SupportedFormatCodeSettings")
                return "this.getFormatCodeSettings()";
            return ctorParam.getNameOrThrow();
        }
    }

    function isAllowedStructurePrinter(name: string) {
        switch (name) {
            case "StructurePrinter":
            case "BlankLineFormattingStructuresPrinter":
            case "NewLineFormattingStructuresPrinter":
            case "SpaceFormattingStructuresPrinter":
            case "CommaSeparatedStructuresPrinter":
            case "CommaNewLineSeparatedStructuresPrinter":
                return false;
        }
        return true;
    }
}
