import { expect } from "chai";
import { CompilerOptionsContainer } from "../../options";
import { ts } from "../../typescript";

describe("SettingsContainer", () => {
  it("should restore nested defaults on reset", () => {
    const container = new CompilerOptionsContainer({ paths: { a: ["x"] }, lib: ["es5"] });
    const settings = container.get();
    settings.paths!.a.push("MUT");
    settings.lib!.push("MUT");

    container.reset();

    expect(container.get()).to.deep.equal({ paths: { a: ["x"] }, lib: ["es5"] });
  });

  it("should restore defaults on every reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    container.reset();
    container.get().lib!.push("MUT");
    container.reset();
    expect(container.get().lib).to.deep.equal(["es5"]);
  });

  it("should not share nested values with the caller's object", () => {
    const defaults: ts.CompilerOptions = { paths: { a: ["x"] }, lib: ["es5"] };
    const container = new CompilerOptionsContainer(defaults);

    container.get().paths!.a.push("MUT");
    container.get().lib!.push("MUT");
    expect(defaults).to.deep.equal({ paths: { a: ["x"] }, lib: ["es5"] });

    defaults.lib!.push("CALLER");
    container.reset();
    expect(container.get().lib).to.deep.equal(["es5"]);
  });

  it("should keep the identity of non-plain values", () => {
    class ConfigFile {
      self = this;
    }
    const configFile = new ConfigFile();
    const date = new Date();
    const defaults = { configFile, nested: { date } } as unknown as ts.CompilerOptions;
    const container = new CompilerOptionsContainer(defaults);

    container.reset();

    const settings = container.get() as any;
    expect(settings.configFile).to.equal(configFile);
    expect(settings.nested.date).to.equal(date);
  });

  it("should keep the identity of a parsed config file", () => {
    const sourceFile = ts.readJsonConfigFile("/tsconfig.json", () => `{ "compilerOptions": { "lib": ["es5"] } }`);
    const options: ts.CompilerOptions = { configFile: sourceFile, lib: ["es5"] };
    const container = new CompilerOptionsContainer(options);

    container.reset();

    expect(container.get().configFile).to.equal(sourceFile);
    expect(container.get().lib).to.deep.equal(["es5"]);
    expect(container.get().lib).to.not.equal(options.lib);
  });

  it("should keep the identity of array subclasses", () => {
    class CustomArray extends Array<string> {}
    const lib = new CustomArray();
    const container = new CompilerOptionsContainer({ lib });

    container.reset();

    expect(container.get().lib).to.equal(lib);
  });

  it("should handle cycles and an own __proto__ key", () => {
    const paths = JSON.parse(`{ "__proto__": ["x"] }`);
    const cycle: any = { name: "cycle" };
    cycle.self = cycle;
    const container = new CompilerOptionsContainer({ paths, plugins: [cycle] });

    container.reset();

    const settings = container.get();
    expect(Object.getOwnPropertyDescriptor(settings.paths, "__proto__")!.value).to.deep.equal(["x"]);
    expect(Object.getPrototypeOf(settings.paths)).to.equal(Object.prototype);
    const plugin = settings.plugins![0] as any;
    expect(plugin).to.not.equal(cycle);
    expect(plugin.self).to.equal(plugin);
  });

  it("should return the same nested values from get until reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    expect(container.get()).to.not.equal(container.get());
    expect(container.get().lib).to.equal(container.get().lib);
  });

  it("should fire onModified once on reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    let count = 0;
    container.onModified(() => count++);
    container.reset();
    expect(count).to.equal(1);
  });
});
