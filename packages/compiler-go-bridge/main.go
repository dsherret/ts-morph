package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	fmt.Println("TypeScript Go Wasm Initialized")
	
	exports := map[string]interface{}{
		"ping": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return "pong"
		}),
		"free": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			if len(args) > 0 {
				id := uint32(args[0].Int())
				GlobalRegistry.Free(id)
			}
			return nil
		}),
	}
	initEditorExports(exports)
	
	// Create the global bridge object
	js.Global().Set("__TS_GO_WASM__", js.ValueOf(exports))

	// Prevent the program from exiting
	<-make(chan struct{})
}
