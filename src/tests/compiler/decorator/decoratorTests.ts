import {expect} from "chai";
import {Decorator, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Decorator), () => {
    function getFirstDecorator(code: string) {
        const result = getInfoFromText<ClassDeclaration>(code);
        const firstDecorator = result.firstChild.getDecorators()[0];
        return {...result, firstDecorator};
    }

    describe(nameof<Decorator>(d => d.isDecoratorFactory), () => {
        it("should not be a decorator factory when has no call expression", () => {
            const {firstDecorator} = getFirstDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(false);
        });

        it("should be a decorator factory when has call expression", () => {
            const {firstDecorator} = getFirstDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });

        it("should be a decorator factory when has call expression with parameters", () => {
            const {firstDecorator} = getFirstDecorator("@decorator('str', 23)\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });
    });

    describe(nameof<Decorator>(d => d.getName), () => {
        it("should get the name for a non-decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstDecorator("@namespaceTest.decorator\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstDecorator("@namespaceTest.decorator()\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getFullName), () => {
        it("should get the name for a non-decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstDecorator("@namespaceTest.decorator\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("namespaceTest.decorator");
        });

        it("should get the name for a decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstDecorator("@namespaceTest.decorator()\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("namespaceTest.decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getCompilerCallExpression), () => {
        it("should return undefined when not a decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getCompilerCallExpression()).to.be.undefined;
        });

        it("should get the compiler call expression when a decorator factory", () => {
            const {firstDecorator} = getFirstDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getCompilerCallExpression()!.arguments.length).to.equal(2);
        });
    });
});
