import cipher, { CipherDirection } from "./_wasm.js";
import { adjectives, nouns, verbs, adverbs } from "human-id";

const adjectiveBiDict = toBiDict(adjectives);
const adjectivesLen = BigInt(adjectives.length);

const nounBiDict = toBiDict(nouns);
const nounsLen = BigInt(nouns.length);

const verbBiDict = toBiDict(verbs);
const verbsLen = BigInt(verbs.length);

const adverbsBiDict = toBiDict(adverbs);
const adverbsLen = BigInt(adverbs.length);

const threeItemMax = adjectivesLen * nounsLen * verbsLen;
const fourItemMax = adjectivesLen * nounsLen * verbsLen * adverbsLen;

const UINT64_MAX = 2n ** 64n - 1n;
const INT64_MIN = -(2n ** 63n - 1n);

export function toHumanId(
    origId: bigint | number,
    key: bigint,
    separator: string = "-"
): string {
    if (typeof origId === "number") {
        origId = BigInt(origId);
    } else if (origId > INT64_MIN && origId < UINT64_MAX) {
        origId = BigInt.asUintN(64, origId);
    } else {
        throw new Error("`origId` doesn't fit in 64 bits!");
    }

    if (key > INT64_MIN && key < UINT64_MAX) {
        key = BigInt.asUintN(64, key);
    } else {
        throw new Error("`key` doesn't fit in 64 bits!");
    }

    if (origId < threeItemMax) {
        let encryptedId = cipher(
            threeItemMax,
            origId,
            key,
            CipherDirection.Encrypt
        );

        const verbId = Number(encryptedId % verbsLen);
        encryptedId /= verbsLen;
        const nounId = Number(encryptedId % nounsLen);
        encryptedId /= nounsLen;
        const adjectiveId = Number(encryptedId);

        return [
            adjectiveBiDict.fromIdx.get(adjectiveId),
            nounBiDict.fromIdx.get(nounId),
            verbBiDict.fromIdx.get(verbId),
        ].join(separator);
    }

    throw new Error(`Input too large: ${origId}`);
}

export function fromHumanId(
    humanId: string | string[],
    key: bigint,
    separator: string = "-"
): { bigint: bigint; number?: number } {
    let words: string[];

    if (typeof humanId === "string") {
        words = humanId.split(separator);
    } else {
        words = humanId;
    }

    let bigint: bigint;
    if (words.length === 3) {
        const [adjective, noun, verb] = words;

        const adjectiveId = adjectiveBiDict.toIdx.get(adjective)!;
        const nounId = nounBiDict.toIdx.get(noun)!;
        const verbId = verbBiDict.toIdx.get(verb)!;

        let encryptedId = adjectiveId * verbsLen * nounsLen;
        encryptedId += nounId * verbsLen;
        encryptedId += verbId;

        bigint = cipher(
            threeItemMax,
            encryptedId,
            key,
            CipherDirection.Decrypt
        );
    } else {
        throw new Error(`Input too large: ${words.length} words`);
    }

    return { bigint, number: Number(bigint) || undefined };
}

function toBiDict<T>(xs: T[]): {
    fromIdx: Map<number, T>;
    toIdx: Map<T, bigint>;
} {
    const fromIdx = new Map(xs.entries());
    const toIdx = new Map(Array.from(fromIdx, ([k, v]) => [v, BigInt(k)]));

    return { fromIdx, toIdx };
}
