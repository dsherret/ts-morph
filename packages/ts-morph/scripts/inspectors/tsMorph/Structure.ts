import { tsMorph } from "@ts-morph/scripts";
import { Memoize } from "@ts-morph/common";
import { WrapperFactory } from "../WrapperFactory";
import { isOverloadStructure } from "../../config";

export class Structure {
    constructor(private readonly wrapperFactory: WrapperFactory, readonly node: tsMorph.InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    @Memoize
    getStructureKindName() {
        const type = this.getType();
        const kindSymbol = type.getProperty("kind");
        if (kindSymbol == null)
            return undefined;

        const structureType = kindSymbol.getTypeAtLocation(this.node);
        return structureType.getNonNullableType().getText().replace(/^.*\.([^\.]+)$/, "$1");
    }

    getFilePath() {
        return this.node.getSourceFile().getFilePath();
    }

    getSymbol() {
        return this.node.getSymbolOrThrow();
    }

    getType() {
        return this.node.getType();
    }

    getStartLineNumber() {
        return this.node.getStartLineNumber();
    }

    isOverloadStructure() {
        return isOverloadStructure(this.getName());
    }

    getProperties() {
        return this.node.getProperties();
    }

    @Memoize
    getBaseStructures() {
        return this.node.getBaseDeclarations().filter(d => !(tsMorph.TypeGuards.isVariableDeclaration(d) && d.getName() === "Structure")).map(d => {
            if (!tsMorph.TypeGuards.isInterfaceDeclaration(d))
                throw new Error(`Unexpected kind: ${d.getKindName()}`);
            return this.wrapperFactory.getStructure(d);
        });
    }

    @Memoize
    getDescendantBaseStructures() {
        return Array.from(getDescendantBaseStructures(this));

        function* getDescendantBaseStructures(structure: Structure): IterableIterator<Structure> {
            const baseStructures = structure.getBaseStructures();
            for (const baseStructure of baseStructures) {
                yield baseStructure;
                yield* getDescendantBaseStructures(baseStructure);
            }
        }
    }
}
