import { expect } from "chai";
import { AdvancedIterator } from "../../utils";

describe(nameof(AdvancedIterator), () => {
    function* getNumIterator() {
        for (let i = 0; i < 10; i++)
            yield i;
    }

    function getIteratedIterator() {
        const iterator = new AdvancedIterator(getNumIterator());
        while (!iterator.done)
            iterator.next();
        return iterator;
    }

    describe(nameof<AdvancedIterator<any>>(i => i.done), () => {
        it("should not be done when not done", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            expect(iterator.done).to.be.false;
        });

        it("should be done when done", () => {
            expect(getIteratedIterator().done).to.be.true;
        });
    });

    describe(nameof<AdvancedIterator<any>>(i => i.next), () => {
        it("should get the next until it runs out", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            const nums: number[] = [];
            while (!iterator.done)
                nums.push(iterator.next());
            expect(nums).to.deep.equal(Array.from(getNumIterator()));
        });

        it("should throw when calling .next at the end of the iterator", () => {
            const iterator = getIteratedIterator();
            expect(() => iterator.next()).to.throw();
        });
    });

    describe(nameof<AdvancedIterator<any>>(i => i.current), () => {
        it("should throw if called before anything else", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            expect(() => iterator.current).to.throw();
        });

        it("should not advance the iterator if called multiple times", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            expect(iterator.current).to.equal(0);
            expect(iterator.current).to.equal(0);
        });

        it("should get the current after going next", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            iterator.next();
            expect(iterator.current).to.equal(1);
        });

        it("should get the current at the end of an iterator", () => {
            const iterator = getIteratedIterator();
            expect(iterator.current).to.equal(9);
        });
    });

    describe(nameof<AdvancedIterator<any>>(i => i.previous), () => {
        it("should throw if called before anything else", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            expect(() => iterator.previous).to.throw();
        });

        it("should throw if called after only moving forward once", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            expect(() => iterator.previous).to.throw();
        });

        it("should get previous if moved forward twice", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            iterator.next();
            expect(iterator.previous).to.equal(0);
        });

        it("should get previous", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            iterator.next();
            iterator.next();
            expect(iterator.previous).to.equal(1);
        });
    });

    describe(nameof<AdvancedIterator<any>>(i => i.peek), () => {
        it("should peek the value if called before anything else", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            expect(iterator.peek).to.equal(0);
        });

        it("should not advance the iterator if called multiple times", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            expect(iterator.peek).to.equal(1);
            expect(iterator.peek).to.equal(1);
        });

        it("should throw at the end of an iterator", () => {
            const iterator = getIteratedIterator();
            expect(() => iterator.peek).to.throw();
        });
    });

    describe(nameof<AdvancedIterator<any>>(i => i.rest), () => {
        it("should iterate through the rest of the values", () => {
            const iterator = new AdvancedIterator(getNumIterator());
            iterator.next();
            iterator.next();
            expect(Array.from(iterator.rest())).to.deep.equal(Array.from(getNumIterator()).slice(2));
        });
    });
});
