import { buffer as wasmCode } from "./feistel.wasm.js";

const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);

export default wasmInstance.exports
    .cycle_walking_cipher_wasm as CycleWalkingCipherFn;

export const enum CipherDirection {
    Encrypt = 0,
    Decrypt = 1,
}

type CycleWalkingCipherFn = (
    maxVal: bigint,
    value: bigint,
    crypt_key: bigint,
    direction: CipherDirection
) => bigint;
