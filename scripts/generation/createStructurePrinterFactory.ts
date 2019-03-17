﻿/**
 * Code Manipulation - Creates the StructurePrinterFactory
 * --------------------------------------------------------
 * Automatically maintains this class based on changes in the application.
 * --------------------------------------------------------
 */
import { TypeGuards, SyntaxKind, MethodDeclarationStructure, ParameterDeclaration, Scope } from "ts-morph";
import { TsMorphInspector } from "../inspectors";

export function createStructurePrinterFactory(inspector: TsMorphInspector) {
    const project = inspector.getProject();
    const sourceFile = project.getSourceFileOrThrow("StructurePrinterFactory.ts");
    sourceFile.removeText();

    // add imports
    sourceFile.addImportDeclarations([{
        namespaceImport: "structurePrinters",
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/structurePrinters/index.ts"))
    }, {
        namedImports: ["SupportedFormatCodeSettings"],
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/options/index.ts"))
    }, {
        namedImports: ["Memoize"],
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/utils/index.ts"))
    }]);

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
                    type: getTypeText(p),
                    hasQuestionToken: p.isOptional()
                }))
            });
        }

        return methods;

        function exposeCtorParam(ctorParam: ParameterDeclaration) {
            const typeName = getTypeText(ctorParam);
            if (typeName === "StructurePrinterFactory")
                return false;
            return true;
        }

        function ctorParamToArgument(ctorParam: ParameterDeclaration) {
            const typeName = getTypeText(ctorParam);
            if (typeName === "StructurePrinterFactory")
                return "this";
            return ctorParam.getNameOrThrow();
        }

        function getTypeText(param: ParameterDeclaration) {
            const typeNode = param.getTypeNode();
            return typeNode == null ? param.getType().getText() : typeNode.getText();
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
