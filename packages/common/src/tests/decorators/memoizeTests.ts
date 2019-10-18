import { Memoize } from "../../decorators";
import { expect } from "chai";

describe(nameof(Memoize), () => {
    let val = 0;
    let argIncrement = 0;
    class MyClass {
        @Memoize
        getNumber() {
            return ++val;
        }

        @Memoize
        getArgumentedValue(argValue: boolean) {
            argIncrement++;
            return argValue.toString() + argIncrement;
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

    it("should work when supplying arguments", () => {
        const val1 = a.getArgumentedValue(false);
        const val2 = a.getArgumentedValue(true);
        expect("false1").to.equal(a.getArgumentedValue(false));
        expect("true2").to.equal(a.getArgumentedValue(true));
        expect(val1).to.equal(a.getArgumentedValue(false));
        expect(val2).to.equal(a.getArgumentedValue(true));
    });

    it("should throw when using memoize on a set accessor", () => {
        expect(() => {
            class OtherClass {
                private value: string | undefined;
                @Memoize
                set test(value: string) {
                    this.value = value;
                }
            }
        }).to.throw(Error);
    });
});
