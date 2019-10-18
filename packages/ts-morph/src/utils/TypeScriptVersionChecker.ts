import { ts } from "@ts-morph/common";
const [tsMajor, tsMinor, tsPatch] = ts.version.split(".").map(v => parseInt(v, 10));

export class TypeScriptVersionChecker {
    private constructor() {
    }

    static isEqual(major: number, minor: number, patch: number) {
        return tsMajor === major && tsMinor === minor && tsPatch === patch;
    }

    static isLessThan(major: number, minor: number, patch: number) {
        if (tsMajor < major)
            return true;
        if (tsMajor === major && tsMinor < minor)
            return true;
        return tsMajor === major && tsMinor === minor && tsPatch < patch;
    }

    static isLessThanOrEqual(major: number, minor: number, patch: number) {
        return TypeScriptVersionChecker.isLessThan(major, minor, patch)
            || TypeScriptVersionChecker.isEqual(major, minor, patch);
    }

    static isGreaterThan(major: number, minor: number, patch: number) {
        return !TypeScriptVersionChecker.isLessThanOrEqual(major, minor, patch);
    }

    static isGreaterThanOrEqual(major: number, minor: number, patch: number) {
        return !TypeScriptVersionChecker.isLessThan(major, minor, patch);
    }
}
