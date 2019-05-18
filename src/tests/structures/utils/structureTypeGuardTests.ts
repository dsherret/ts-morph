import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { StructureTypeGuards, StructureKind, ClassDeclarationStructure, Structure, AbstractableNodeStructure } from "../../../structures";

// most of this code is not worth testing because it's auto generated

describe(nameof(StructureTypeGuards), () => {
    describe(nameof(StructureTypeGuards.hasName), () => {
        it("should be true when it has a name", () => {
            const structure: ClassDeclarationStructure = { kind: StructureKind.Class, name: "test" };
            if (StructureTypeGuards.hasName(structure))
                assert<IsExact<typeof structure.name, string>>(true);
            expect(StructureTypeGuards.hasName(structure)).to.be.true;
        });

        it("should be false when it doesn't have a name", () => {
            const structure: ClassDeclarationStructure = { kind: StructureKind.Class };
            expect(StructureTypeGuards.hasName(structure)).to.be.false;
        });
    });

    describe("base structure method tests", () => {
        it("should type the type correctly within a guard", () => {
            const structure: Structure & { kind: StructureKind; } = { kind: StructureKind.Class };
            if (StructureTypeGuards.isAbstractable(structure))
                assert<IsExact<typeof structure, Structure & { kind: StructureKind; } & AbstractableNodeStructure>>(true);
            expect(StructureTypeGuards.isAbstractable(structure)).to.be.true;
        });
    });

    describe("top level structure method types", () => {
        it("should type the type correctly within a guard", () => {
            const structure: Structure & { kind: StructureKind; } = { kind: StructureKind.Class };
            if (StructureTypeGuards.isClass(structure))
                assert<IsExact<typeof structure, ClassDeclarationStructure>>(true);
            expect(StructureTypeGuards.isClass(structure)).to.be.true;
        });
    });
});
