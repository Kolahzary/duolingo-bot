import { Unit } from './unit.interface.js';

/**
 * Represents a section in the learning path.
 * Each section contains multiple units and tracks completion progress.
 */
export interface PathSection {
    /**
     * Index of this section in the path.
     * @example 0
     */
    index: number;

    /**
     * Debug name for this section.
     * @example "Path Section 0"
     */
    debugName: string;

    /**
     * Type of this section (e.g., "learning").
     * @example "learning"
     */
    type: string;

    /**
     * Number of units completed in this section.
     * @example 1
     */
    completedUnits: number;

    /**
     * Total number of units in this section.
     * @example 9
     */
    totalUnits: number;

    /**
     * Array of units within this section.
     * @example [{ "unitIndex": 0, "levels": [...] }]
     */
    units: Unit[];
}
