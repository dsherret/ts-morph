import { expect } from "chai";
import { Signature } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Signature), () => {
    function getSignature(text: string) {
        const {sourceFile} = getInfoFromText(text);
        const type = sourceFile.getVariableDeclarations()[0].getType();
        return type.getCallSignatures()[0];
    }

    describe(nameof<Signature>(s => s.getTypeParameters), () => {
        it("should return an empty array when there are none", () => {
            const signature = getSignature("let t: () => void;");
            expect(signature.getTypeParameters().length).to.equal(0);
        });

        it("should get the type parameters", () => {
            const signature = getSignature("let t: <T>() => T;");
            expect(signature.getTypeParameters().map(t => t.getText())).to.deep.equal(["T"]);
        });
    });

    describe(nameof<Signature>(s => s.getParameters), () => {
        it("should return an empty array when there are none", () => {
            const signature = getSignature("let t: () => void;");
            expect(signature.getParameters().length).to.deep.equal(0);
        });

        it("should get the parameters", () => {
            const signature = getSignature("let t: (a) => void;");
            expect(signature.getParameters().map(p => p.getName())).to.deep.equal(["a"]);
        });
    });

    describe(nameof<Signature>(s => s.getReturnType), () => {
        it("should get the return type", () => {
            const signature = getSignature("let t: (a) => void;");
            expect(signature.getReturnType().getText()).to.equal("void");
        });
    });

    describe(nameof<Signature>(s => s.getDocumentationComments), () => {
        it("should be empty when they don't exist", () => {
            const signature = getSignature("let t: (a) => void;");
            expect(signature.getDocumentationComments().length).to.equal(0);
        });

        it("should get the doc comments when they exist", () => {
            const signature = getSignature(`
interface MyInterface {
    /**
     * Docs
     */
    /**
     * Docs 2
     */
    () => void;
}
let t: MyInterface;
`);

            expect(signature.getDocumentationComments().map(c => ({ text: c.getText(), kind: c.getKind() }))).to.deep.equal([
                { text: "Docs", kind: "text" },
                { text: "\n", kind: "lineBreak" }, // not sure why the compiler returns this...
                { text: "Docs 2", kind: "text" }
            ]);
        });
    });

    describe(nameof<Signature>(s => s.getJsDocTags), () => {
        it("should be empty when they don't exist", () => {
            const signature = getSignature(`
interface MyInterface {
    /**
     * Docs
     */
    /**
     * Docs 2
     */
    () => void;
}
let t: MyInterface;
`);
            expect(signature.getJsDocTags().length).to.equal(0);
        });

        it("should get the js doc tags when they exist", () => {
            const signature = getSignature(`
interface MyInterface {
    /**
     * @property Testing.
     */
    (a) => void;
}
let t: MyInterface;
`);

            expect(signature.getJsDocTags().map(c => ({ name: c.getName(), text: c.getText() }))).to.deep.equal([
                { name: "property", text: "Testing." }
            ]);
        });
    });
});
