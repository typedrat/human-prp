import { adjectives, nouns, verbs, adverbs } from "human-id";
import { BiDict } from "./bidict.js";
import cipher, { CipherDirection } from "./_wasm.js";

type WordKind = "adjective" | "noun" | "verb" | "adverb";

const wordInfo: { [K in WordKind]: BiDict<string> & { length: bigint } } = {
    adjective: {
        ...new BiDict(adjectives),
        length: BigInt(adjectives.length),
    },
    adverb: {
        ...new BiDict(adverbs),
        length: BigInt(adverbs.length),
    },
    noun: {
        ...new BiDict(nouns),
        length: BigInt(nouns.length),
    },
    verb: {
        ...new BiDict(verbs),
        length: BigInt(verbs.length),
    },
};

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

    const format = origIdToFormat(origId);
    const encryptedId = cipher(
        formatToMaxValue(format),
        origId,
        key,
        CipherDirection.Encrypt
    );

    return formattedIdToWords(format, encryptedId).join(separator);
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

    const format = humanIdToFormat(words.length);
    let encryptedId = formattedWordsToId(format, words);

    if (encryptedId > INT64_MIN && encryptedId < UINT64_MAX) {
        encryptedId = BigInt.asUintN(64, encryptedId);
    } else {
        throw new Error("`encryptedId` doesn't fit in 64 bits!");
    }

    const bigint = cipher(
        formatToMaxValue(format),
        encryptedId,
        key,
        CipherDirection.Decrypt
    );

    return { bigint, number: Number(bigint) || undefined };
}

//

type Format = WordKind[];

function origIdToFormat(id: bigint): Format {
    let wordKinds: Format = ["adjective", "noun", "verb"];

    id /= wordInfo.verb.length;
    id /= wordInfo.noun.length;
    id /= wordInfo.adjective.length;

    if (id > 0) {
        wordKinds.push("adverb");
        id /= wordInfo.adverb.length;
    }

    while (id > 0) {
        wordKinds.unshift("adjective");
        id /= wordInfo.adjective.length;
    }

    return wordKinds;
}

function humanIdToFormat(idLen: number): Format {
    let wordKinds: Format = ["adjective", "noun", "verb"];
    idLen -= 3;

    if (idLen > 0) {
        wordKinds.push("adverb");
        idLen--;
    }

    while (idLen > 0) {
        wordKinds.unshift("adjective");
        idLen--;
    }

    return wordKinds;
}

function formatToMaxValue(xs: Format): bigint {
    return xs.reduce((val, kind) => val * wordInfo[kind].length, 1n);
}

function formattedIdToWords(format: Format, id: bigint): string[] {
    let words: string[] = [];

    format.reverse();
    format.forEach((kind) => {
        const wordId = id % wordInfo[kind].length;
        id /= wordInfo[kind].length;

        words.push(wordInfo[kind].fromIdx.get(wordId)!);
    });
    words.reverse();

    return words;
}

function formattedWordsToId(format: Format, words: string[]): bigint {
    let factor: bigint = 1n;
    let id: bigint = 0n;

    format.reverse();
    format.forEach((kind, i) => {
        id += wordInfo[kind].toIdx.get(words[i])! * factor;
        factor *= wordInfo[kind].length;
    });

    return id;
}
