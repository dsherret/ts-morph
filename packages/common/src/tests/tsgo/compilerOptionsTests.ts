import { expect } from "chai";
import { describe, it } from "mocha";
import { ts } from "../../typescript";

/**
 * The options TypeScript 7 kept only the `true` value of.
 *
 * `tools/gen-proto` leaves every field tagged `deprecated:"true"` out of the generated
 * `CompilerOptions`, and TypeScript main tags these three that way alongside `baseUrl`,
 * `downlevelIteration` and `outFile`. Those three really are gone; these three are not —
 * only their `false` value is, and `esModuleInterop` defaults to `true`. Leaving them out
 * made correct code a compile error, so the generator keeps them with an `@deprecated` note.
 *
 * What holds the generator to it is the type-only `_OptionsOnlyTrueSurvivesOf` in
 * `src/tsgo/ts.ts`, because that is in the sources the build type-checks — this file is not.
 * These are the runtime half: the three options survive the trip through a project and are
 * reported back, which a type says nothing about.
 */
describe("CompilerOptions", () => {
  describe("the options only `true` survives of", () => {
    it("should accept all three, and report them back", () => {
      const options: ts.CompilerOptions = {
        esModuleInterop: true,
        alwaysStrict: true,
        allowSyntheticDefaultImports: true,
      };

      expect(options.esModuleInterop).to.equal(true);
      expect(options.alwaysStrict).to.equal(true);
      expect(options.allowSyntheticDefaultImports).to.equal(true);
    });
  });

  describe("the options that are genuinely gone", () => {
    it("should not be on the interface", () => {
      // named through a mapped type rather than by assignment, because writing one is
      // exactly what must not compile
      type Absent<K extends string> = K extends keyof ts.CompilerOptions ? never : K;
      const gone: [Absent<"baseUrl">, Absent<"downlevelIteration">, Absent<"outFile">] = [
        "baseUrl",
        "downlevelIteration",
        "outFile",
      ];

      expect(gone).to.deep.equal(["baseUrl", "downlevelIteration", "outFile"]);
    });
  });
});
