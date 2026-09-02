import { SpanMapFeature } from "../enums/spanMapFeature.enum";
import { SpanMapFidelity } from "../enums/spanMapFidelity.enum";
import { SpanMapKind } from "../enums/spanMapKind.enum";
import type { ReadonlyTextRange } from "./ast";
export { SpanMapFeature, SpanMapFidelity, SpanMapKind };
/** Maps one half-open virtual range to one half-open original range. */
export interface SpanMapSegment {
    readonly virtualStart: number;
    readonly virtualEnd: number;
    readonly originalStart: number;
    readonly originalEnd: number;
    readonly kind: SpanMapKind;
    readonly features?: SpanMapFeature;
}
/** Internal segment representation after omitted features have been normalized to `All`. */
type NormalizedSpanMapSegment = SpanMapSegment & {
    readonly features: SpanMapFeature;
};
/** One virtual projection of an original position and its mapping fidelity. */
export interface MappedPosition {
    readonly position: number;
    readonly fidelity: SpanMapFidelity;
}
/** One virtual projection of an original range and its mapping fidelity. */
export interface MappedRange {
    readonly range: ReadonlyTextRange;
    readonly fidelity: SpanMapFidelity;
}
/** Provides bidirectional span-aware mapping between virtual and original text. */
export declare class SpanMap {
    readonly segments: readonly NormalizedSpanMapSegment[];
    private originalIndex;
    /** Copies and sorts segments by virtual start, normalizing omitted features to `All`. */
    constructor(segments: readonly SpanMapSegment[]);
    /** Reports whether a mapping is a precise, edit-safe projection through one verbatim segment. */
    static isExact(fidelity: SpanMapFidelity): boolean;
    /** Reports whether a mapping lies in one verbatim or atom segment. */
    static isSingleSegment(fidelity: SpanMapFidelity): boolean;
    /** Reports whether the input had no counterpart in the target text. */
    static isNone(fidelity: SpanMapFidelity): boolean;
    /**
     * Maps a virtual range to original text. Gaps map to insertion points with `None` fidelity,
     * and ranges crossing segment boundaries map their endpoints with `Approximate` fidelity.
     */
    virtualToOriginalSpan(range: ReadonlyTextRange): MappedRange;
    /** Maps a visible LS result only when every covered segment participates in `feature`. */
    virtualToOriginalSpanForFeature(range: ReadonlyTextRange, feature: SpanMapFeature): MappedRange;
    /** Maps a virtual position to original text, using `None` fidelity for synthesized gaps. */
    virtualToOriginalPosition(position: number): MappedPosition;
    virtualToOriginalPositionForFeature(position: number, feature: SpanMapFeature): MappedPosition;
    /**
     * Returns every virtual projection of an original position whose segment participates in `feature`.
     * Segment ends are inclusive for point mapping, so adjacent spans may both produce projections.
     * Results are ordered by virtual position; uncovered or disabled positions produce no results.
     */
    originalToVirtualPositions(position: number, feature: SpanMapFeature): readonly MappedPosition[];
    /**
     * Returns every feature-compatible virtual projection of an original range.
     * A range contained by one or more segments produces one exact or atom result per matching segment.
     *
     * A range that starts in one group and ends in another can have several possible virtual ranges. For
     * example, suppose two original segments are each copied twice into the virtual text:
     *
     * ```text
     * original:   [ A ][ B ]
     *                [---)       range from inside A to inside B
     *
     * virtual:    [ A ][ B ]      [ A ][ B ]
     *                ^   ^          ^   ^
     *              start end      start end
     *                1   3          11  13
     * ```
     *
     * The map says that the range may start at 1 or 11 and end at 3 or 13, but it does not say which copy of A
     * belongs with which copy of B. We choose the smallest range around each possible location, producing [1,3)
     * and [11,13). We do not return [1,13), because it contains both smaller candidates and would include code
     * that may be unrelated to the original range. These cross-group results have approximate fidelity.
     */
    originalToVirtualSpans(range: ReadonlyTextRange, feature: SpanMapFeature): readonly MappedRange[];
    /** Maps one range through an ordered segment index in the direction selected by `reverse`. */
    private mapRange;
    /** Maps one position through an ordered segment index in the direction selected by `reverse`. */
    private mapPoint;
    /** Returns the lazily built original-text interval index. */
    private getOriginalIndex;
    private virtualRangeSupportsFeature;
}
