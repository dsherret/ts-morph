import { StringUtils, SyntaxKind } from "@ts-morph/common";
import { SourceFile, Symbol } from "../../compiler";

export class ModuleUtils {
    private constructor() {
    }

    static isModuleSpecifierRelative(text: string) {
        return text.startsWith("./")
            || text.startsWith("../");
    }

    static getReferencedSourceFileFromSymbol(symbol: Symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations.length === 0 || declarations[0].getKind() !== SyntaxKind.SourceFile)
            return undefined;
        return declarations[0] as SourceFile;
    }
}
