import * as errors from "./../errors";

/**
 * Advanced IterableIterator.
 */
export class AdvancedIterator<T> {
    private readonly buffer: (T | undefined)[] = Array.from(Array(3)); // previous, current, next
    private bufferIndex = 0;
    private isDone = false;
    private nextCount = 0;

    constructor(private readonly iterator: IterableIterator<T>) {
        this.advance();
    }

    /** If the iterator has reached the end. */
    get done() {
        return this.isDone;
    }

    /** Current value. */
    get current() {
        if (this.nextCount === 0)
            throw new errors.InvalidOperationError("Cannot get the current when the iterator has not been advanced.");
        if (this.done)
            throw new errors.InvalidOperationError("Cannot get the current at the end of the iterator.");
        return this.buffer[this.bufferIndex];
    }

    /** Previous value. */
    get previous() {
        if (this.nextCount <= 1)
            throw new errors.InvalidOperationError("Cannot get the previous when the iterator has not advanced enough.");
        return this.buffer[(this.bufferIndex + this.buffer.length - 1) % this.buffer.length];
    }

    /** Iterates forward and returns the next value. */
    next() {
        if (this.done)
            throw new errors.InvalidOperationError("Cannot get the next when at the end of the iterator.");

        const next = this.buffer[this.getNextBufferIndex()]!;
        this.advance();
        this.nextCount++;
        return next;
    }

    /** Iterates over the rest of the values */
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
