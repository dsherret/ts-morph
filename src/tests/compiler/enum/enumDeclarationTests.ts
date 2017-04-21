import {expect} from "chai";
import {EnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(EnumDeclaration), () => {
    describe(nameof<EnumDeclaration>(d => d.getMember), () => {
        it("should get a member by its name", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            const member = firstChild.getMember("member2")!;
            expect(member.getText()).to.equal("member2");
        });

        it("should get a member by a function", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            const member = firstChild.getMember(m => m.getName() === "member2")!;
            expect(member.getText()).to.equal("member2");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getMembers), () => {
        it("should get all the members", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1 = 1, member2 }");
            const members = firstChild.getMembers();
            expect(members.length).to.equal(2);
        });
    });

    describe(nameof<EnumDeclaration>(d => d.addMember), () => {
        it("should add a member without a value", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n}\n");
            firstChild.addMember({
                name: "myName"
            });
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myName\n}\n");
        });

        it("should add a member with a value", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n}\n");
            firstChild.addMember({
                name: "myName",
                value: 5
            });
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myName = 5\n}\n");
        });

        it("should add a member and add a comma to the last member when no comma exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n    member1\n}\n");
            firstChild.addMember({
                name: "member2"
            });
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    member1,\n    member2\n}\n");
        });

        it("should add a member and not add a comma to the last member when a comma exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n    member1,\n}\n");
            firstChild.addMember({
                name: "member2"
            });
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    member1,\n    member2\n}\n");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.isConstEnum), () => {
        it("should have a const keyword when it has one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.true;
        });

        it("should not have a const keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.false;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getConstKeyword), () => {
        it("should get a const keyword when it has one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.getConstKeyword()!.getText()).to.equal("const");
        });

        it("should not get a const keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.getConstKeyword()).is.undefined;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.setIsConstEnum), () => {
        it("should set as const enum when not one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            firstChild.setIsConstEnum(true);
            expect(firstChild.getText()).to.equal("const enum MyEnum {}");
        });

        it("should set as not const enum when is one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            firstChild.setIsConstEnum(false);
            expect(firstChild.getText()).to.equal("enum MyEnum {}");
        });

        it("should stay the same if setting to same value", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            firstChild.setIsConstEnum(true);
            expect(firstChild.getText()).to.equal("const enum MyEnum {}");
        });
    });
});
