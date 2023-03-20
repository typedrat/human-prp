#pragma once
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum { ENCRYPT = 0, DECRYPT = 1 } direction_t;

uint64_t cycle_walking_cipher(uint64_t maxval, uint64_t value,
                              uint64_t crypt_key, direction_t direction);

#ifdef __cplusplus
}
#endif
