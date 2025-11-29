/**
 * Represents a language course in the user's course list.
 * Each object in the `courses` array represents a language being learned.
 */
export interface Course {
    /**
     * Whether a placement test is available for this course.
     * @example false
     */
    placementTestAvailable: boolean;

    /**
     * ISO code of the source language (the language you're learning from).
     * @example "en"
     */
    fromLanguage: string;

    /**
     * ISO code of the target language (the language you're learning).
     * @example "eo"
     */
    learningLanguage: string;

    /**
     * The subject type of the course.
     * @example "language"
     */
    subject: string;

    /**
     * Total XP (experience points) earned in this course.
     * @example 4120
     */
    xp: number;

    /**
     * The topic identifier for this course.
     * @example "eo"
     */
    topic: string;

    /**
     * Unique course identifier in the format DUOLINGO_{LEARNING}_{FROM}.
     * @example "DUOLINGO_EO_EN"
     */
    id: string;

    /**
     * The author/creator of the course.
     * @example "duolingo"
     */
    authorId?: string;

    /**
     * Human-readable name of the language being learned.
     * @example "Esperanto"
     */
    title?: string;

    /**
     * Whether the health system is enabled for this course.
     * @example true
     */
    healthEnabled?: boolean;

    /**
     * Whether this course should be preloaded.
     * @example false
     */
    preload?: boolean;
}
