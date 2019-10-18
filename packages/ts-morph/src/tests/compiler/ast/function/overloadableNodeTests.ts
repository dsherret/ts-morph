import { expect } from "chai";
import { ClassDeclaration, ConstructorDeclaration, FunctionDeclaration, OverloadableNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(OverloadableNode), () => {
    const functionCode = `function myFunction();function myFunction() {}`;
    const { sourceFile: functionSourceFile } = getInfoFromText<FunctionDeclaration>(functionCode);
    const functions = functionSourceFile.getChildSyntaxListOrThrow().getChildren() as FunctionDeclaration[];

    const constructorCode = `class MyClass { constructor();constructor();constructor() {} myMethod(): void;myMethod() {} abstract test(); }`;
    const { firstChild: classChild } = getInfoFromText<ClassDeclaration>(constructorCode);
    const constructors = classChild.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ConstructorDeclaration) as ConstructorDeclaration[];

    const ambientCode = `declare function func();declare function func();`;
    const { sourceFile: ambientSourceFile } = getInfoFromText<FunctionDeclaration>(ambientCode);
    const ambientFunctions = ambientSourceFile.getChildSyntaxListOrThrow().getChildren() as FunctionDeclaration[];

    describe(nameof<OverloadableNode>(d => d.isImplementation), () => {
        it("should not be an implementation when not one", () => {
            expect(functions[0].isImplementation()).to.be.false;
        });

        it("should be an implementation when is one", () => {
            expect(functions[1].isImplementation()).to.be.true;
        });
    });

    describe(nameof<OverloadableNode>(d => d.isOverload), () => {
        it("should be an overload when is one", () => {
            expect(functions[0].isOverload()).to.be.true;
        });

        it("should not be an overload when not one", () => {
            expect(functions[1].isOverload()).to.be.false;
        });

        it("should not be for abstract methods", () => {
            expect(classChild.getMethodOrThrow(m => m.isAbstract()).isOverload()).to.be.true;
        });

        it("should be in ambient contexts", () => {
            expect(ambientFunctions.map(f => f.isOverload())).to.deep.equal([true, true]);
        });
    });

    describe(nameof<OverloadableNode>(d => d.getOverloads), () => {
        describe("functions", () => {
            it("should have the right number of overloads when asking an overload", () => {
                const overloads = functions[0].getOverloads();
                expect(functions[0].isOverload()).to.be.true;
                expect(overloads.length).to.equal(1);
                expect(overloads[0]).to.equal(functions[0]);
            });

            it("should have the right number of overloads when asking an implementation", () => {
                const overloads = functions[1].getOverloads();
                expect(functions[1].isImplementation()).to.be.true;
                expect(overloads.length).to.equal(1);
                expect(overloads[0]).to.equal(functions[0]);
            });
        });

        describe("constructors", () => {
            it("should have the right number of overloads when asking an overload", () => {
                const overloads = constructors[0].getOverloads();
                expect(constructors[0].isOverload()).to.be.true;
                expect(overloads.length).to.equal(2);
                expect(overloads.map(o => o.isOverload())).to.deep.equal([true, true]);
            });

            it("should have the right number of overloads when asking an implementation", () => {
                const overloads = constructors[2].getOverloads();
                expect(constructors[2].isImplementation()).to.be.true;
                expect(overloads.length).to.equal(2);
                expect(overloads.map(o => o.isOverload())).to.deep.equal([true, true]);
            });
        });

        describe("ambient context", () => {
            it("should return all the overloads in an ambient context", () => {
                const code = `declare function myFunction(): void;declare function myFunction(): void;`;
                const { firstChild } = getInfoFromText<FunctionDeclaration>(code);
                expect(firstChild.getOverloads().length).to.equal(2);
            });
        });
    });

    describe(nameof<OverloadableNode>(d => d.getImplementation), () => {
        describe("functions", () => {
            it("should get the implementation when asking an overload", () => {
                const implementation = functions[0].getImplementation();
                expect(implementation).to.equal(functions[1]);
            });

            it("should have the right number of overloads when asking an implementation", () => {
                const implementation = functions[1].getImplementation();
                expect(implementation).to.equal(functions[1]);
            });
        });

        describe("constructors", () => {
            it("should get the implementation when asking an overload", () => {
                const implementation = constructors[0].getImplementation();
                expect(implementation).to.equal(constructors[2]);
            });

            it("should have the right number of overloads when asking an implementation", () => {
                const implementation = constructors[2].getImplementation();
                expect(implementation).to.equal(constructors[2]);
            });
        });

        describe("ambient context", () => {
            it("should return undefined in an ambient context", () => {
                const code = `declare function myFunction(): void;declare function myFunction(): void;`;
                const { firstChild } = getInfoFromText<FunctionDeclaration>(code);
                expect(firstChild.getImplementation()).to.be.undefined;
            });
        });
    });

    describe(nameof<OverloadableNode>(d => d.getImplementationOrThrow), () => {
        it("should get the implementation when asking an overload", () => {
            const implementation = functions[0].getImplementationOrThrow();
            expect(implementation).to.equal(functions[1]);
        });

        it("should throw in an ambient context", () => {
            const code = `declare function myFunction(): void;declare function myFunction(): void;`;
            const { firstChild } = getInfoFromText<FunctionDeclaration>(code);
            expect(() => firstChild.getImplementationOrThrow()).to.throw();
        });
    });
});
