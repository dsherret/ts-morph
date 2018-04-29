/**
 * Code Manipulation - Creates the StructurePrinterFactory
 * --------------------------------------------------------
 * Automatically maintains this class based on changes in the application.
 * --------------------------------------------------------
 */
import { TypeGuards, SyntaxKind, MethodDeclarationStructure, ParameterDeclaration, Scope } from "ts-simple-ast";
import { TsSimpleAstInspector } from "./inspectors";

export function createStructurePrinterFactory(inspector: TsSimpleAstInspector) {
    const project = inspector.getProject();
    const sourceFile = project.getSourceFileOrThrow("StructurePrinterFactory.ts");
    sourceFile.removeText();

    // add imports
    sourceFile.addImportDeclaration({
        namespaceImport: "structurePrinters",
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/structurePrinters/index.ts"))
    });
    sourceFile.addImportDeclaration({
        namedImports: ["SupportedFormatCodeSettings"],
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/options/index.ts"))
    });
    sourceFile.addImportDeclaration({
        namedImports: ["Memoize"],
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/utils/index.ts"))
    });

    sourceFile.addClass({
        docs: [{ description: "Cached lazy factory for StructurePrinters." }],
        isExported: true,
        name: "StructurePrinterFactory",
        ctors: [{
            parameters: [{ isReadonly: true, scope: Scope.Private, name: "_getFormatCodeSettings", type: "() => SupportedFormatCodeSettings" }]
        }],
        methods: [{
            name: "getFormatCodeSettings",
            returnType: "SupportedFormatCodeSettings",
            bodyText: "return this._getFormatCodeSettings();"
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
            const ctor = structurePrinter.getConstructors()[0] || structurePrinter.getBaseClassOrThrow().getConstructors()[0];
            const ctorParams = ctor == null ? [] : ctor.getParameters();
            const exposedCtorParams = ctorParams.filter(exposeCtorParam);
            const name = structurePrinter.getNameOrThrow();
            methods.push({
                decorators: [{ name: "Memoize" }],
                name: `for${name.replace(/StructurePrinter$/, "")}`,
                returnType: `structurePrinters.${name}`,
                bodyText: `return new structurePrinters.${name}(${ctorParams.map(ctorParamToArgument).join(", ")});`,
                parameters: exposedCtorParams.map(p => ({
                    name: p.getNameOrThrow(),
                    type: p.getTypeNodeOrThrow().getText()
                }))
            });
        }

        return methods;

        function exposeCtorParam(ctorParam: ParameterDeclaration) {
            const typeName = ctorParam.getTypeNodeOrThrow().getText();
            if (typeName === "StructurePrinterFactory")
                return false;
            return true;
        }

        function ctorParamToArgument(ctorParam: ParameterDeclaration) {
            const typeName = ctorParam.getTypeNodeOrThrow().getText();
            if (typeName === "StructurePrinterFactory")
                return "this";
            return ctorParam.getNameOrThrow();
        }
    }

    function isAllowedStructurePrinter(name: string) {
        switch (name) {
            case "StructurePrinter":
            case "FactoryStructurePrinter":
            case "BlankLineFormattingStructuresPrinter":
            case "NewLineFormattingStructuresPrinter":
            case "SpaceFormattingStructuresPrinter":
            case "CommaSeparatedStructuresPrinter":
            case "CommaNewLineSeparatedStructuresPrinter":
            case "StringStructurePrinter":
                return false;
        }
        return true;
    }
}
