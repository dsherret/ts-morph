import { Logger } from "./Logger";

export abstract class EnableableLogger implements Logger {
    private enabled = false;

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    log(text: string) {
        if (this.enabled)
            this.logInternal(text);
    }

    warn(text: string) {
        if (this.enabled)
            this.warnInternal(text);
    }

    protected abstract logInternal(text: string): void;
    protected abstract warnInternal(text: string): void;
}
