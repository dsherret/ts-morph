import { EOL } from "os";
export class PercentageLogger {
    private lastPercentage: string | undefined;

    logAsPercentage(index: number, count: number) {
        const percentage = (index / count * 100).toFixed(1);
        if (percentage === this.lastPercentage)
            return;

        const percentangeChar = "%";
        if (this.lastPercentage != null)
            (process.stdout as any).moveCursor((this.lastPercentage.length + percentangeChar.length + 2) * -1, 0);
        process.stdout.write("[" + percentage + percentangeChar + "]");

        this.lastPercentage = percentage;
    }

    finish() {
        this.logAsPercentage(1, 1); // 100%
        process.stdout.write(EOL);
    }
}
