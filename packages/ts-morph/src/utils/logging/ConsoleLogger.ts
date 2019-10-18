import { EnableableLogger } from "./EnableableLogger";

export class ConsoleLogger extends EnableableLogger {
    protected logInternal(text: string) {
        console.log(text);
    }

    protected warnInternal(text: string) {
        console.warn(text);
    }
}
