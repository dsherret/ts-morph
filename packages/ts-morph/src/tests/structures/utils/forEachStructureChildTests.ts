import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { forEachStructureChild, StructureKind, InterfaceDeclarationStructure, PropertySignatureStructure, ClassDeclarationStructure,
    Structures } from "../../../structures";
import { getInfoFromText } from "../../compiler/testHelpers";

describe(nameof(forEachStructureChild), () => {
    it("should return a child in a child array of unknown structures", () => {
        const structure = getInfoFromText("class C {} interface I {} class T {}").sourceFile.getStructure();
        const interfaceStructure = forEachStructureChild(structure, child => {
            return child.kind === StructureKind.Interface ? child : undefined;
        });
        assert<IsExact<typeof interfaceStructure, InterfaceDeclarationStructure | undefined>>(true);

        expect(interfaceStructure).to.not.be.undefined;
        expect(interfaceStructure!.kind).to.equal(StructureKind.Interface);
    });

    it("should return a child in a child array of known structure kinds where the structures don't have kinds", () => {
        const structure: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: "MyInterface",
            properties: [{ name: "p1" }, { name: "p2" }, { name: "p3" }]
        };
        const propertyStructure = forEachStructureChild(structure, child => {
            return child.kind === StructureKind.PropertySignature && child.name === "p2" ? child : undefined;
        });
        assert<IsExact<typeof propertyStructure, PropertySignatureStructure | undefined>>(true);

        expect(propertyStructure).to.not.be.undefined;
        expect(propertyStructure!.kind).to.equal(StructureKind.PropertySignature);
        expect(propertyStructure!.name).to.equal("p2");

        // should be the same reference so that updates to this structure affect the main reference
        expect(propertyStructure).to.equal(structure.properties![1]);
    });

    it("should handle a passed in array", () => {
        const structures: Structures[] = [{
            kind: StructureKind.Interface,
            name: "I"
        }, {
            kind: StructureKind.Class,
            name: "C"
        }];
        const structure = forEachStructureChild(structures, child => {
            return child.kind === StructureKind.Class ? child : undefined;
        });
        assert<IsExact<typeof structure, ClassDeclarationStructure | undefined>>(true);

        expect(structure).to.not.be.undefined;
        expect(structure!.kind).to.equal(StructureKind.Class);
    });
});
