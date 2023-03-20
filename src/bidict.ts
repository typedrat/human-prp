export class BiDict<T> {
    fromIdx: Map<bigint, T>;
    toIdx: Map<T, bigint>;

    constructor(xs: T[]) {
        this.fromIdx = new Map(xs.map((v, k) => [BigInt(k), v]));
        this.toIdx = new Map(Array.from(this.fromIdx, ([k, v]) => [v, k]));
    }
}
