package main

import (
	"syscall/js"
)

// Export Editor-related functions to Wasm Bridge
func initEditorExports(exports map[string]interface{}) {
	exports["updateTextSpan"] = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Expect args: sourceFileId (int), start (int), end (int), newText (string)
		if len(args) < 4 {
			return nil
		}

		sourceFileId := uint32(args[0].Int())
		start := args[1].Int()
		end := args[2].Int()
		newText := args[3].String()

		// Get source file from registry
		sourceFile := GlobalRegistry.Get(sourceFileId)
		if sourceFile == nil {
			return nil
		}

		// (Mock implementation) Apply update to source file using typescript-go
		// e.g. sf.Update(start, end, newText)
		_ = start
		_ = end
		_ = newText

		// Parse again / update internal representation
		
		// Return new AST root handle
		newRootId := GlobalRegistry.Register(sourceFile) 
		return int(newRootId)
	})

	exports["formatNode"] = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return ""
		}
		// nodeId := uint32(args[0].Int())
		// format using typescript-go printer
		return "/* formatted text */"
	})
}
