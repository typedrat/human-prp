# human-prp
[![npm](https://img.shields.io/npm/v/human-prp)](https://www.npmjs.com/package/human-prp) [![npm bundle size](https://deno.bundlejs.com/?q=human-prp&config={%22analysis%22:true}&badge=)](https://www.npmjs.com/package/human-prp)

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
