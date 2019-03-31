import { expect } from "chai";
import { LanguageService } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";
import { removeUnusedDeclarations } from "../../../../compiler/tools/refactors/removeUnusedDeclarations";

describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)}`, () => {

    function test(code: string, expected: string) {
        const { sourceFile, project } = getInfoFromText(code);
        removeUnusedDeclarations(sourceFile, project.getLanguageService());
        expect(sourceFile.getText().replace(/\s+/g, " ").trim()).to.equals(expected.replace(/\s+/g, " ").trim());
        return { sourceFile, project };
    }

    xit("should not leave forgotten nodes", () => {
        const code = `
            import {used, unused} from "bar";
            export const c = used + 1;
        `;
        const expected = `
            import {used} from "bar";
            export const c = used + 1;
        `;
        const { sourceFile, project } = getInfoFromText(code);
        const c = sourceFile.getVariableDeclaration("c")!;
        const i = sourceFile.getImportDeclarations()[0]!;
        expect(c.isExported()).to.be.true;
        project.getLanguageService().removeUnusedDeclarations(sourceFile);
        expect(sourceFile.getText().replace(/\s+/g, " ").trim()).to.equals(expected.replace(/\s+/g, " ").trim());
        expect(() => c.isExported()).not.to.throw();
        expect(() => i.getNonWhitespaceStart()).not.to.throw();
    });

    describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)} imports`, () => {
        it("should remove unused import declarations, import names, and default imports", () => {
            test(`
                import {foo} from "foo";
                import * as a from "a";
                import b from "b";
                import {used, unused} from "bar";
                export const c = used + 1;
                `, `
                import {used} from "bar";
                export const c = used + 1;
            `);
        });
    });

    describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)} parameters`, () => {
        it("should remove unused parameters and type parameters", () => {
            test(`
                export function f1(p1: number, p2: string) { return p1 + 1; }
                `, `
                export function f1(p1: number) { return p1 + 1; }
            `);
        });
        it("should not remove a unused parameter that is before than a used one", () => {
            test(`
                export const g = (p1?: Date[], p2?: string, p3 = 1) => p2 || "
                `, `
                export const g = (_p1?: Date[], p2?: string) => p2 || "
            `);
        });
        it("should remove all unused named parameters", () => {
            test(`
                export class A {
                    m({a, b, c}: {a: number, b: string, c: boolean}) { return a + (c ? 0 : 1)}
                }
                `, `
                export class A {
                    m({a, c}: {a: number, b: string, c: boolean}) { return a + (c ? 0 : 1)}
                }
            `);
        });
        it("should remove unused spread parameters", () => {
            test(`
                export function f(a: number, ...args: any[]) { return a * a }
            `, `
                export function f(a: number) { return a * a }
            `);
        });
        it("should not remove unused params if signature implements a type", () => {
            test(`
                export interface I {
                    m(a: number, b: boolean): number
                }
                export class C implements I {
                    m(a: number, b: boolean) { return a }
                }
            `, `
                export interface I {
                    m(a: number, b: boolean): number
                }
                export class C implements I {
                    m(a: number, _b: boolean) { return a }
                }
            `);
        });
    });

    describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)} type parameters`, () => {
        it("should remove unused parameters and type parameters", () => {
            test(`
                export function f2<T1 extends 1|2, T2=any>(p3: T1) { return p3; }
                `, `
                export function f2<T1 extends 1|2>(p3: T1) { return p3; }
            `);
        });
        it("should remove all unused type parameters no matter their order", () => {
            test(`
                export type Custom<T, S, K> = S extends string ? never : any
                `, `
                export type Custom<S> = S extends string ? never : any
            `);
        });
        it("should remove a type parameters that is referenced only in a unused parameter", () => {
            test(`
                export function f3<T1 extends 1|2, T2=any>(p4: T1, p5: T2) { return p4; }
                `, `
                export function f3<T1 extends 1|2>(p4: T1) { return p4; }
            `);
        });
    });

    describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)} members`, () => {
        it("should remove unused private members, parameters and type parameters", () => {
            test(`
                export class C<T extends number, S> {
                    prop1 = 1
                    public prop2 = 2
                    protected prop3 = 3
                    private prop4 = 4
                    private prop5 = 5
                    private prop6 = 6
                    private constructor(private a: number, e = false) { }
                    private m(b: number) { }
                    protected n(h: T = 2, c = this.prop6) { return h + this.prop5 }
                    public o(d?: S) { }
                }
                `, `
                export class C<T extends number> {
                    prop1 = 1
                    public prop2 = 2
                    protected prop3 = 3
                    private prop5 = 5
                    private constructor(private a: number) { }
                    protected n(h: T = 2) { return h + this.prop5 }
                    public o() { }
                }
            `);
        });
    });

    describe(`${nameof<LanguageService>(l => l.removeUnusedDeclarations)} variables`, () => {
        it("should remove unused declarations inside a block", () => {
            test(`
                export function f() {
                    const c = 1
                    const d = 1
                    var i = 1
                    function g() { return i }
                    function h() { return 1 }
                    const { x, y, z } = { x: 1, y: true }
                    return d + g() + x
                }
                `, `
                export function f() {
                    const d = 1
                    var i = 1
                    function g() { return i }
                    const { x } = { x: 1, y: true }
                    return d + g() + x
                }
            `);
        });
        it("should remove unused named variables", () => {
            test(`
                import { g } from 'g'
                export function f() {
                    var {a, b, c} = g()
                    return b
                }
                `, `
                import { g } from 'g'
                export function f() {
                    var {b} = g()
                    return b
                }
            `);
        });
    });

});
