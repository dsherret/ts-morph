import {Node} from "./../compiler";
import {Formatting} from "./formatting/Formatting";
import {PropertyDeclarationFormatting} from "./formatting/PropertyDeclarationFormatting";

const allFormatting = [
    new PropertyDeclarationFormatting()
];

const formattingBySyntaxKind: { [name: number]: Formatting<Node, {}>; } = {};

for (const formatting of allFormatting) {
    if (formattingBySyntaxKind[formatting.getKind()] != null)
        throw new Error("Multiple formatting with the same syntax kind exists.");

    formattingBySyntaxKind[formatting.getKind()] = formatting;
}

export {formattingBySyntaxKind};
