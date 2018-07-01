import { Comparer } from "./Comparer";

export class LocaleStringComparer implements Comparer<string> {
    static readonly instance = new LocaleStringComparer();

    compareTo(a: string, b: string) {
        // always use en-us to everyone gets the same behaviour
        const comparisonResult = a.localeCompare(b, "en-us-u-kf-upper");

        if (comparisonResult < 0)
            return -1;
        else if (comparisonResult === 0)
            return 0;
        return 1;
    }
}
