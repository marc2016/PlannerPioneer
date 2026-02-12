
/**
 * Calculates the PERT (Program Evaluation and Review Technique) expected duration.
 * Formula: (Optimistic + 4 * Most Likely + Pessimistic) / 6
 * 
 * @param optimistic The optimistic time estimate (optional).
 * @param mostLikely The most likely time estimate.
 * @param pessimistic The pessimistic time estimate (optional).
 * @returns The expected duration.
 */
export const calculatePert = (optimistic: number | undefined, mostLikely: number, pessimistic: number | undefined): number => {
    const o = optimistic ?? mostLikely;
    const p = pessimistic ?? mostLikely;
    const result = (o + 4 * mostLikely + p) / 6;
    return parseFloat(result.toFixed(1));
};

/**
 * Formats a duration in hours to a readable string.
 * e.g. 1.5 -> "1.5h"
 * 
 * @param hours The duration in hours.
 * @returns A formatted string.
 */
export const formatDuration = (hours: number): string => {
    return `${parseFloat(hours.toFixed(1))}h`;
};
