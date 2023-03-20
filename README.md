# human-prp

human-prp is a library that uses pseudorandom permutations to generate
human-friendly IDs.

Specifically, it uses a dynamic-size balanced Feistel network based on a
non-cryptographic hash function to select words from an included word list.

I want to stress the word non-cryptographic above! The current implementation
uses a bog-standard Fibonacci hash to match the
[postgres extension](https://github.com/dverite/permuteseq)
that it is based on.

## Building

Prerequsites for building the WASM:
- clang
- lld
