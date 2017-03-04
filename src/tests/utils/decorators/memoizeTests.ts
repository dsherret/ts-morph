import {expect} from "chai";
import {Memoize} from "./../../../utils/decorators/Memoize";

describe(nameof(Memoize), () => {
    let val = 0;
    class MyClass {
        @Memoize
        getNumber() {
            return ++val;
        }

        @Memoize
        get value() {
            return ++val;
        }
    }

    const a = new MyClass();
    const b = new MyClass();

    it("method should be memoized", () => {
        expect(a.getNumber()).to.equal(a.getNumber());
    });

    it("accessor should be memoized", () => {
        expect(a.value).to.equal(a.value);
    });

    it("multiple instances shouldn't share values for methods", () => {
        expect(a.getNumber()).to.not.equal(b.getNumber());
    });

    it("multiple instances shouldn't share values for accessors", () => {
        expect(a.value).to.not.equal(b.value);
    });

    it("should throw if supplying arguments", () => {
        expect(() => (a as any).getNumber(2)).to.throw(Error);
    });

    it("should throw when using memoize on a set accessor", () => {
        expect(() => {
            class MyClass {
                private value: string;
                @Memoize
                set test(value: string) {
                    this.value = value;
                }
            }
        }).to.throw(Error);
    });
});
