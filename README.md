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

If you want to fully rebuild the library, run `make` or `pnpm build`. If you
don't want to install `clang` and `lld` and aren't editing the contents of
`cbits/` or the files generated from it, you can just run `tsc` and it should Do
The Right Thing.
