import { CodeBlock } from "./CodeBlock.ts";
import { parseMarkDown } from "./parseMarkDown.ts";

export class MarkDownFile {
  constructor(private readonly filePath: string, private readonly text: string) {
  }

  getFilePath() {
    return this.filePath;
  }

  getText() {
    return this.text;
  }

  getCodeBlocks(): CodeBlock[] {
    return parseMarkDown(this);
  }
}
