import { expect } from "chai";
import { matchGlobs } from "../../fileSystem";

describe("matchGlobs", () => {
  const paths = ["/dir/a.ts", "/dir/b.ts", "/dir/sub/c.ts", "/dir/d.js"];

  it("should return the matches in the order of the paths", () => {
    expect(matchGlobs(paths, "**/*.ts", "/dir")).to.deep.equal(["/dir/a.ts", "/dir/b.ts", "/dir/sub/c.ts"]);
  });

  it("should not return a path twice when several patterns match it", () => {
    expect(matchGlobs(paths, ["**/*.ts", "**/a.ts"], "/dir")).to.deep.equal(["/dir/a.ts", "/dir/b.ts", "/dir/sub/c.ts"]);
  });

  it("should remove the matches of a negated pattern", () => {
    expect(matchGlobs(paths, ["**/*.ts", "!**/sub/**"], "/dir")).to.deep.equal(["/dir/a.ts", "/dir/b.ts"]);
  });

  it("should add a path back when a later pattern matches it again", () => {
    expect(matchGlobs(paths, ["**/*.ts", "!**/a.ts", "**/a.ts"], "/dir")).to.deep.equal(["/dir/a.ts", "/dir/b.ts", "/dir/sub/c.ts"]);
  });
});
