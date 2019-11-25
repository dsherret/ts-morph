import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #665", () => {
    it("should not error when getting the descendants when there's jsx in a ts file", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const file = project.createSourceFile("test.ts", `
function oi(){
  const snapshot = { isDraggingOver: false };
  function getSourceStyle(opts) {
    return {};
  }
  return <div>
        <div></div>
        <p style={getSourceStyle(snapshot.isDraggingOver)}></p>
      </div>
}
`);

        expect(() => file.getDescendants()).to.not.throw();
    });

    it("should not error when getting the descendants when there's jsx in a ts file for second example", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const file = project.createSourceFile("test.ts", `
import * as React from 'react';

export const Broken: React.SFC<{ arg: boolean }> = (props) => (
    <div style={getStyle(props.arg)} >...</div>
)
`);

        expect(() => file.getDescendants()).to.not.throw();
    });
});
