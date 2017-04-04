export class FileUtils {
    private constructor() {
    }

    static standardizeSlashes(fileName: string) {
        return fileName.replace(/\\/g, "/");
    }

    static filePathMatches(fileName: string | null, searchString: string | null) {
        const splitBySlash = (p: string | null) => this.standardizeSlashes(p || "").replace(/^\//, "").split("/");

        const fileNameItems = splitBySlash(fileName);
        const searchItems = splitBySlash(searchString);

        if (searchItems.length > fileNameItems.length)
            return false;

        for (let i = 0; i < searchItems.length; i++) {
            if (searchItems[searchItems.length - i - 1] !== fileNameItems[fileNameItems.length - i - 1])
                return false;
        }

        return searchItems.length > 0;
    }
}
