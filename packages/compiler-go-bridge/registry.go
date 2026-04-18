package main

import (
	"sync"
	"sync/atomic"
)

// HandleRegistry manages pointers passing across the Wasm boundary.
type HandleRegistry struct {
	mu     sync.RWMutex
	store  map[uint32]interface{}
	nextID uint32
}

func NewHandleRegistry() *HandleRegistry {
	return &HandleRegistry{
		store:  make(map[uint32]interface{}),
		nextID: 1, // Start at 1, 0 means nil/invalid
	}
}

func (r *HandleRegistry) Register(obj interface{}) uint32 {
	if obj == nil {
		return 0
	}
	id := atomic.AddUint32(&r.nextID, 1)
	r.mu.Lock()
	r.store[id] = obj
	r.mu.Unlock()
	return id
}

func (r *HandleRegistry) Get(id uint32) interface{} {
	if id == 0 {
		return nil
	}
	r.mu.RLock()
	obj := r.store[id]
	r.mu.RUnlock()
	return obj
}

func (r *HandleRegistry) Free(id uint32) {
	if id == 0 {
		return
	}
	r.mu.Lock()
	delete(r.store, id)
	r.mu.Unlock()
}

var GlobalRegistry = NewHandleRegistry()
