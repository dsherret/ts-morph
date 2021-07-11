import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #1171", () => {
    const code = `type Jsonify<T> = T extends { toJSON(): infer U }
  ? U
  : T extends object
    ? {
      [k in keyof T]: Jsonify<T[k]>;
    }
    : T;

class Foo {
  prop!: string[];
}

function foo() {
  return {} as Jsonify<Foo>
}`;

    it("should not reset the program when calling getSymbol and the symbol resolves to a lib file", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("index.ts", code);

        // verify the property's type
        verifyPropertyType();

        // cause manipulation which resets the program
        sourceFile.addStatements("test;");

        // try again and ensure it works
        verifyPropertyType();

        function verifyPropertyType() {
            const fn = sourceFile.getFunctionOrThrow("foo");
            const prop = fn.getReturnType().getPropertyOrThrow("prop");
            expect(prop.getTypeAtLocation(fn).getText()).to.equal("string[]");
            // interesting scenario here where this line was getting a symbol inside
            // the es5 lib.d.ts file and the symbol would eagerly do `getValueDeclaration()`
            // but that would cause the source file of the lib file to be wrapped and fire
            // a "source file added" event. This event would cause a reset of the program,
            // which meant the symbol was no longer in sync with the node.
            prop.getTypeAtLocation(fn).getSymbol();
            expect(prop.getTypeAtLocation(fn).getText()).to.equal("string[]");
        }
    });
});
