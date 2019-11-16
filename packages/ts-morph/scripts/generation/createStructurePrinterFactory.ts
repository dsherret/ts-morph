/**
 * Code Manipulation - Creates the StructurePrinterFactory
 * --------------------------------------------------------
 * Automatically maintains this class based on changes in the application.
 * --------------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { ArrayUtils } from "@ts-morph/common";
import { TsMorphInspector } from "../inspectors";

export function createStructurePrinterFactory(inspector: TsMorphInspector) {
    const project = inspector.getProject();
    const sourceFile = project.getSourceFileOrThrow("StructurePrinterFactory.ts");
    sourceFile.removeText();

    // add imports
    sourceFile.addImportDeclarations([{
        namedImports: ["Memoize"],
        moduleSpecifier: "@ts-morph/common"
    }, {
        namespaceImport: "structurePrinters",
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/structurePrinters/index.ts"))
    }, {
        namedImports: ["SupportedFormatCodeSettings"],
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/options/index.ts"))
    }]);

    sourceFile.addClass({
        docs: [{ description: "Cached lazy factory for StructurePrinters." }],
        isExported: true,
        name: "StructurePrinterFactory",
        ctors: [{
            parameters: [{ isReadonly: true, scope: tsMorph.Scope.Private, name: "_getFormatCodeSettings", type: "() => SupportedFormatCodeSettings" }]
        }],
        methods: [{
            name: "getFormatCodeSettings",
            returnType: "SupportedFormatCodeSettings",
            statements: ["return this._getFormatCodeSettings();"]
        }, ...getMethods()]
    });

    sourceFile.insertText(0, writer => writer.writeLine("// DO NOT EDIT - Automatically maintained by createStructurePrinterFactory.ts"));

    function getMethods() {
        const structurePrinters = ArrayUtils.flatten(Array.from(project.getSourceFileOrThrow("./src/structurePrinters/index.ts")
            .getExportedDeclarations()
            .values()))
            .filter(tsMorph.TypeGuards.isClassDeclaration)
            .filter(c => isAllowedStructurePrinter(c.getNameOrThrow()));
        const methods: tsMorph.MethodDeclarationStructure[] = [];

        for (const structurePrinter of structurePrinters) {
            const ctor = structurePrinter.getConstructors()[0] ?? structurePrinter.getBaseClassOrThrow().getConstructors()[0];
            const ctorParams = ctor?.getParameters() ?? [];
            const exposedCtorParams = ctorParams.filter(exposeCtorParam);
            const name = structurePrinter.getNameOrThrow();
            methods.push({
                kind: tsMorph.StructureKind.Method,
                decorators: [{ name: "Memoize" }],
                name: `for${name.replace(/StructurePrinter$/, "")}`,
                returnType: `structurePrinters.${name}`,
                statements: [`return new structurePrinters.${name}(${ctorParams.map(ctorParamToArgument).join(", ")});`],
                parameters: exposedCtorParams.map(p => ({
                    name: p.getName(),
                    type: getTypeText(p),
                    hasQuestionToken: p.isOptional()
                }))
            });
        }

        return methods;

        function exposeCtorParam(ctorParam: tsMorph.ParameterDeclaration) {
            const typeName = getTypeText(ctorParam);
            if (typeName === "StructurePrinterFactory")
                return false;
            return true;
        }

        function ctorParamToArgument(ctorParam: tsMorph.ParameterDeclaration) {
            const typeName = getTypeText(ctorParam);
            if (typeName === "StructurePrinterFactory")
                return "this";
            return ctorParam.getName();
        }

        function getTypeText(param: tsMorph.ParameterDeclaration) {
            const typeNode = param.getTypeNode();
            return typeNode?.getText() ?? param.getType().getText();
        }
    }

    function isAllowedStructurePrinter(name: string) {
        switch (name) {
            case "Printer":
            case "NodePrinter":
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
