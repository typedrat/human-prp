import { buffer as wasmCode } from "./feistel.wasm.js";

const wasmInstance = await WebAssembly.instantiate(wasmCode);

export const cycle_walking_cipher_wasm = wasmInstance.instance.exports
    .cycle_walking_cipher_wasm as CycleWalkingCipherFn;

export default cycle_walking_cipher_wasm;

export const enum CipherDirection {
    Encrypt = 0,
    Decrypt = 1,
}

type CycleWalkingCipherFn = (
    maxval: bigint,
    value: bigint,
    crypt_key: bigint,
    direction: CipherDirection
) => bigint;
