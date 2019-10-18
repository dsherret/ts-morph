export interface Logger {
    setEnabled(enabled: boolean): void;
    log(text: string): void;
    warn(text: string): void;
}
