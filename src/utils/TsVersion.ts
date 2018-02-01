import * as ts from "typescript";

export class TsVersion {
    private static versions = ts.version.split(".").map(v => parseInt(v, 10));

    static getMajor() {
        return this.versions[0];
    }

    static getMinor() {
        return this.versions[1];
    }

    static greaterThanEqualToVersion(major: number, minor: number) {
        const currentMajor = this.getMajor();
        const currentMinor = this.getMinor();

        if (currentMajor < major)
            return false;
        if (currentMajor > major)
            return true;

        return currentMinor >= minor;
    }
}
