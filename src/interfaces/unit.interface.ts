import { Level } from './level.interface.js';

/**
 * Represents a unit within a path section.
 * Each unit contains multiple levels and has a teaching objective.
 */
export interface Unit {
    /**
     * Index of this unit within its section.
     * @example 0
     */
    unitIndex: number;

    /**
     * Array of levels within this unit.
     * @example [{ "id": "...", "state": "legendary", ... }]
     */
    levels: Level[];

    /**
     * Optional guidebook information for this unit.
     * The URL points to a JSON file containing additional learning resources.
     * @example { "url": "https://..." }
     */
    guidebook?: {
        /**
         * URL to the guidebook JSON file.
         * @example "https://d1btvuu4dwu627.cloudfront.net/guidebook/..."
         */
        url: string;
    };

    /**
     * Description of what this unit teaches (e.g., "Talk about events", "Use basic words").
     * @example "Use basic words"
     */
    teachingObjective?: string;

    /**
     * @example null
     */
    cefrLevel?: string | null;

    /**
     * @example false
     */
    isUnlocked?: boolean;

    /**
     * @example null
     */
    learningUnitType?: string | null;

    /**
     * @example true
     */
    isInIntro?: boolean;

    /**
     * @example 0
     */
    totalSpacedRepetitionSessions?: number;
}
