#include <stdint.h>

#include "feistel.h"

uint32_t find_half_block_size(uint64_t interval);
uint32_t hash_uint32(uint32_t k);

__attribute__((export_name("cycle_walking_cipher_wasm"))) uint64_t
cycle_walking_cipher(uint64_t maxval, uint64_t value, uint64_t crypt_key,
                     direction_t direction) {
    const int NUM_ROUNDS = 10;

    uint32_t half_block_size = find_half_block_size(maxval);
    uint32_t half_block_mask = (1 << half_block_size) - 1;

    crypt_key = hash_uint32(crypt_key & 0xffffffff) |
                ((uint64_t)hash_uint32((crypt_key >> 32) & 0xffffffff)) << 32;

    uint64_t result;
    uint32_t l1, r1, l2, r2;

    l1 = value >> half_block_size;
    r1 = value & half_block_mask;

    do {
        for (int i = 0; i < NUM_ROUNDS; i++) {
            l2 = r1;

            uint32_t subkey =
                crypt_key >>
                ((half_block_size *
                  (direction == ENCRYPT ? i : NUM_ROUNDS - 1 - i)) &
                 0x3f);
            subkey += direction == ENCRYPT ? i : NUM_ROUNDS - 1 - i;

            r2 = (l1 ^ hash_uint32(r1) ^ hash_uint32(subkey)) & half_block_mask;
            l1 = l2;
            r1 = r2;
        }

        result = ((uint64_t)r1 << half_block_size) | l1;

        // one last swap to prepare for the next round
        l1 = r2;
        r1 = l2;
    } while (result > maxval);

    return result;
}

// courtesy of the Postgres source code 🙃
uint32_t hash_uint32(uint32_t k) {
    uint32_t a, b, c;
    a = b = c = 0x9e3779b9 + (uint32_t)sizeof(uint32_t) + 3923095;

    a += k;

    c ^= b;
    c -= __builtin_rotateleft32(b, 14);
    a ^= c;
    a -= __builtin_rotateleft32(c, 11);
    b ^= a;
    b -= __builtin_rotateleft32(a, 25);
    c ^= b;
    c -= __builtin_rotateleft32(b, 16);
    a ^= c;
    a -= __builtin_rotateleft32(c, 4);
    b ^= a;
    b -= __builtin_rotateleft32(a, 14);
    c ^= b;
    c -= __builtin_rotateleft32(b, 24);
    return c;
}

uint32_t find_half_block_size(uint64_t interval) {
    uint32_t half_block_size = 1;

    while (half_block_size <= 32 &&
           ((uint64_t)1 << (2 * half_block_size)) < interval) {
        half_block_size++;
    }

    return half_block_size;
}
