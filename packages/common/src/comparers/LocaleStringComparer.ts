import { Comparer } from "./Comparer";

/**
 * Compares two strings by en-us-u-kf-upper locale.
 */
export class LocaleStringComparer implements Comparer<string> {
    /** Static instance for reuse. */
    static readonly instance = new LocaleStringComparer();

    /** @inheritdoc */
    compareTo(a: string, b: string) {
        // always use en-us so everyone gets the same behaviour
        const comparisonResult = a.localeCompare(b, "en-us-u-kf-upper");

        if (comparisonResult < 0)
            return -1;
        else if (comparisonResult === 0)
            return 0;
        return 1;
    }
}
