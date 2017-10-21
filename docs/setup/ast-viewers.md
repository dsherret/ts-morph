---
title: AST Viewers
---

## AST Viewers

An AST viewer is a useful way to help understand the TypeScript AST for some source code.

I have evaluated a few AST viewers and the only one I can recommend is the one available in `atom-typescript`. Many AST viewers do not give a sufficient level of detail to understand what's going on.

### Atom TypeScript

This AST viewer gives an excellent view of the AST.

1. Install [Atom](https://atom.io/).
2. Install [atom-typescript](https://atom.io/packages/atom-typescript).
3. Create a new typescript file.
4. Paste in your typescript code.

    ![TypeScript file](images/atom-file.png)

5. Important: Ensure the current typescript document has focus.
6. Open the command palette (Windows/Linux: ctrl+shift+p, Mac: cmd+shift+p).
7. Type `TypeScript: Ast Full` and hit enter.

    ![Command Palette](images/atom-command-palette.png)

8. A new tab will appear with the AST.

    [![Ast Viewer](images/atom-ast_small.png)](images/atom-ast.png)

*Bug warning:* There seems to be an issue with the AST viewer where you have to close the "TypeScript AST" tab before running the `TypeScript: Ast Full` command again.