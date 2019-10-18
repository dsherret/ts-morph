import { errors } from "@ts-morph/common";

export class AdvancedIterator<T> {
    private readonly buffer: (T | undefined)[] = [undefined, undefined, undefined]; // previous, current, next
    private bufferIndex = 0;
    private isDone = false;
    private nextCount = 0;

    constructor(private readonly iterator: IterableIterator<T>) {
        this.advance();
    }

    get done() {
        return this.isDone;
    }

    get current() {
        if (this.nextCount === 0)
            throw new errors.InvalidOperationError("Cannot get the current when the iterator has not been advanced.");
        return this.buffer[this.bufferIndex]!;
    }

    get previous() {
        if (this.nextCount <= 1)
            throw new errors.InvalidOperationError("Cannot get the previous when the iterator has not advanced enough.");
        return this.buffer[(this.bufferIndex + this.buffer.length - 1) % this.buffer.length]!;
    }

    get peek() {
        if (this.isDone)
            throw new errors.InvalidOperationError("Cannot peek at the end of the iterator.");
        return this.buffer[(this.bufferIndex + 1) % this.buffer.length]!;
    }

    next() {
        if (this.done)
            throw new errors.InvalidOperationError("Cannot get the next when at the end of the iterator.");

        const next = this.buffer[this.getNextBufferIndex()]!;
        this.advance();
        this.nextCount++;
        return next;
    }

    *rest() {
        while (!this.done)
            yield this.next();
    }

    private advance() {
        const next = this.iterator.next();
        this.bufferIndex = this.getNextBufferIndex();

        if (next.done) {
            this.isDone = true;
            return;
        }

        this.buffer[this.getNextBufferIndex()] = next.value;
    }

    private getNextBufferIndex() {
        return (this.bufferIndex + 1) % this.buffer.length;
    }
}
