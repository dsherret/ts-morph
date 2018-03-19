import {InterfaceDeclaration} from "../../../src/main";
import {Memoize, TypeGuards, ArrayUtils} from "../../../src/utils";
import {WrapperFactory} from "../WrapperFactory";
import {isOverloadStructure} from "../../config";

export class Structure {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    getFilePath() {
        return this.node.getSourceFile().getFilePath();
    }

    isOverloadStructure() {
        return isOverloadStructure(this.getName());
    }

    @Memoize
    getBaseStructures() {
        return this.node.getBaseDeclarations().map(d => {
            if (!TypeGuards.isInterfaceDeclaration(d))
                throw new Error(`Unexpected kind: ${d.getKindName()}`);
            return this.wrapperFactory.getStructure(d);
        });
    }

    @Memoize
    getDescendantBaseStructures() {
        return ArrayUtils.from(getDescendantBaseStructures(this));

        function* getDescendantBaseStructures(structure: Structure): IterableIterator<Structure> {
            const baseStructures = structure.getBaseStructures();
            for (const baseStructure of baseStructures) {
                yield baseStructure;
                yield* getDescendantBaseStructures(baseStructure);
            }
        }
    }
}
