import { EditorSettings, nameof, NewLineKind, ts } from "@ts-morph/common";
import { expect } from "chai";
import { QuoteKind, UserPreferences } from "../compiler";
import { IndentationText, ManipulationSettings, ManipulationSettingsContainer } from "../options";
describe("IndentationText", () => {
  // ensure this enum is correct. It's hard to read all the spaces since string enums can't use computed values

  it("should have a tab when has a tab", () => {
    expect(IndentationText.Tab).to.equal("\t");
  });

  it("should have two spaces when has two", () => {
    expect(IndentationText.TwoSpaces).to.equal(" ".repeat(2));
  });

  it("should have four spaces when has four", () => {
    expect(IndentationText.FourSpaces).to.equal(" ".repeat(4));
  });

  it("should have eight spaces when has eight", () => {
    expect(IndentationText.EightSpaces).to.equal(" ".repeat(8));
  });
});

describe("ManipulationSettingsContainer", () => {
  function checkSettings(settings: ManipulationSettingsContainer, settingsSettings: ManipulationSettings) {
    expect(settings.get()).to.deep.equal(settingsSettings);
  }

  it("should clear the derived caches on reset", () => {
    const settings = new ManipulationSettingsContainer();
    settings.set({ indentationText: IndentationText.TwoSpaces, quoteKind: QuoteKind.Single });
    expect(settings.getEditorSettings().indentSize).to.equal(2);
    expect(settings.getFormatCodeSettings().indentSize).to.equal(2);
    expect(settings.getUserPreferences().quotePreference).to.equal("single");

    let modifiedCount = 0;
    let indentSizeInListener: number | undefined;
    settings.onModified(() => {
      modifiedCount++;
      indentSizeInListener = settings.getEditorSettings().indentSize;
    });
    settings.reset();

    expect(modifiedCount).to.equal(1);
    expect(indentSizeInListener).to.equal(4);
    expect(settings.getEditorSettings().indentSize).to.equal(4);
    expect(settings.getFormatCodeSettings().indentSize).to.equal(4);
    expect(settings.getUserPreferences().quotePreference).to.equal("double");
  });

  it("should not call an overridden onModified during construction", () => {
    class CustomSettings extends ManipulationSettingsContainer {
      readonly actions: (() => void)[] = [];
      #count = 0;

      onModified(action: () => void) {
        this.#count++;
        this.actions.push(action);
        super.onModified(action);
      }
    }

    expect(new CustomSettings().actions.length).to.equal(0);
  });

  it("should have the correct defaults", () => {
    const settings = new ManipulationSettingsContainer();
    checkSettings(settings, {
      quoteKind: QuoteKind.Double,
      newLineKind: NewLineKind.LineFeed,
      indentationText: IndentationText.FourSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      usePrefixAndSuffixTextForRename: false,
      useTrailingCommas: false,
    });
  });

  it("should set the settings when partially setting them", () => {
    const settings = new ManipulationSettingsContainer();
    settings.set({
      quoteKind: QuoteKind.Single,
    });

    checkSettings(settings, {
      quoteKind: QuoteKind.Single,
      newLineKind: NewLineKind.LineFeed,
      indentationText: IndentationText.FourSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      usePrefixAndSuffixTextForRename: false,
      useTrailingCommas: false,
    });
  });

  it("should set the settings when setting all of them", () => {
    const settings = new ManipulationSettingsContainer();
    settings.set({
      quoteKind: QuoteKind.Single,
      newLineKind: NewLineKind.CarriageReturnLineFeed,
      indentationText: IndentationText.EightSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
      usePrefixAndSuffixTextForRename: true,
    });

    checkSettings(settings, {
      quoteKind: QuoteKind.Single,
      newLineKind: NewLineKind.CarriageReturnLineFeed,
      indentationText: IndentationText.EightSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
      usePrefixAndSuffixTextForRename: true,
      useTrailingCommas: false,
    });
  });

  describe(nameof<ManipulationSettingsContainer>("getEditorSettings"), () => {
    function doTest(actual: EditorSettings, expected: EditorSettings) {
      expect(actual).is.deep.equal(expected);
    }

    it("should get the default editor settings", () => {
      doTest(new ManipulationSettingsContainer().getEditorSettings(), {
        convertTabsToSpaces: true,
        newLineCharacter: "\n",
        indentStyle: ts.IndentStyle.Smart,
        indentSize: 4,
        tabSize: 4,
      });
    });

    it("should get the correct editor settings after changing", () => {
      const container = new ManipulationSettingsContainer();
      container.getEditorSettings(); // fill the internal cache
      container.set({
        indentationText: IndentationText.Tab,
        newLineKind: NewLineKind.CarriageReturnLineFeed,
      });

      doTest(container.getEditorSettings(), {
        convertTabsToSpaces: false,
        newLineCharacter: "\r\n",
        indentStyle: ts.IndentStyle.Smart,
        indentSize: 1,
        tabSize: 1,
      });
    });
  });

  describe(nameof<ManipulationSettingsContainer>("getUserPreferences"), () => {
    function doTest(actual: UserPreferences, expected: UserPreferences) {
      expect(actual).is.deep.equal(expected);
    }

    it("should get the default preferences", () => {
      doTest(new ManipulationSettingsContainer().getUserPreferences(), {
        quotePreference: "double",
        providePrefixAndSuffixTextForRename: false,
      });
    });

    it("should have a single preferences after changing it", () => {
      const container = new ManipulationSettingsContainer();
      container.set({
        quoteKind: QuoteKind.Single,
        usePrefixAndSuffixTextForRename: true,
      });

      doTest(container.getUserPreferences(), {
        quotePreference: "single",
        providePrefixAndSuffixTextForRename: true,
      });
    });
  });
});
