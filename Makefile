ifeq ($(OS), Windows_NT)
	EXECUTABLE=test-feistel.exe
else
	EXECUTABLE=test-feistel
endif

ifndef CLANG
	CLANG=clang
endif

ifndef CLANGXX
	CLANGXX=clang++
endif

CFLAGS += -Wno-unknown-attributes -O3 -std=c17
CXXFLAGS += -Wno-unknown-attributes -O3 -std=c++17

library: dist/metafile-esm.json dist/metafile-cjs.json

all: exe library

exe: $(EXECUTABLE)

dist/metafile-cjs.json: $(wildcard src/*.ts) src/feistel.wasm.ts
	pnpm tsup --format cjs

dist/metafile-esm.json: $(wildcard src/*.ts) src/feistel.wasm.ts
	pnpm tsup --format esm --dts

$(EXECUTABLE): test.cpp.o feistel.c.o
	$(CLANGXX) $^ -o $@

src/feistel.wasm.ts: feistel.wasm
	pnpm wasmwrap --input $^ --output $@

feistel.wasm: ./cbits/feistel.c
	$(CLANG) $(CFLAGS) --target=wasm32 -nostdlib -Wl,--no-entry $^ -o $@

%.c.o: ./cbits/%.c
	$(CLANG) $(CFLAGS) -c $< -o $@

%.cpp.o: ./cbits/%.cpp
	$(CLANGXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -rf *.c.o *.cpp.o $(EXECUTABLE)* *.wasm src/feistel.wasm.ts dist/

.PHONY: clean
