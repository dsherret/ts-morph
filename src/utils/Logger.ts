export class Logger {
    private static enabled = false;

    static setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    static log(text: string) {
        if (this.enabled)
            console.log(text);
    }

    static warn(text: string) {
        if (this.enabled)
            console.warn(text);
    }
}
