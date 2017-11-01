export abstract class BaseError extends Error {
    constructor(message: string, prototype: any) {
        super(message);

        this.message = message;

        // workaround for extending error to work in ES5 :(
        Object.setPrototypeOf(this, prototype);
    }
}
