/**
 * Represents a single level within a unit in the learning path.
 * Contains detailed progress and metadata for the level.
 */
export interface Level {
    /**
     * Unique identifier for this level.
     * @example "9467d8fba22069c2e32ea7c701f4fe72"
     */
    id: string;

    /**
     * Current state of the level.
     * Possible values: 'legendary', 'completed', 'active', 'locked'
     * @example "legendary"
     */
    state: string;

    /**
     * Number of sessions completed for this level.
     * @example 4
     */
    finishedSessions: number;

    /**
     * Total number of sessions required to complete this level.
     * @example 4
     */
    totalSessions: number;

    /**
     * @example "Introducing Yourself, Level 0"
     */
    debugName: string;

    /**
     * @example true
     */
    hasLevelReview: boolean;

    /**
     * @example "skill"
     */
    type: string;

    /**
     * @example "regular"
     */
    subtype: string;

    /**
     * @example false
     */
    isInProgressSequence: boolean;

    /**
     * @example null
     */
    dailyRefreshInfo: any | null;

    /**
     * @example 0
     */
    absoluteNodeIndex: number;

    /**
     * @example { "reachedScore": 5, "learningScore": 6, ... }
     */
    levelScoreInfo: {
        /**
         * @example 5
         */
        reachedScore: number;
        /**
         * @example 6
         */
        learningScore: number;
        /**
         * @example "SUB_UNIT_1"
         */
        touchPointType: string;
        /**
         * @example 0
         */
        reachedProgress: number;
        /**
         * @example 0.125
         */
        completedProgress: number;
    };

    /**
     * @example null
     */
    sourceLevel: any | null;

    /**
     * @example { "skillId": "...", "crownLevelIndex": 0, ... }
     */
    pathLevelMetadata: {
        /**
         * @example "d0e863a72f45ab3a5c5145e2ad7d76e5"
         */
        skillId?: string;
        /**
         * @example "d0e863a72f45ab3a5c5145e2ad7d76e5"
         */
        anchorSkillId?: string;
        /**
         * @example 0
         */
        crownLevelIndex?: number;
        /**
         * Detailed state of the node in the learning path.
         * Provides more granular state information than the top-level state field.
         * @example "legendary"
         */
        nodeState: string;
        /**
         * @example null
         */
        lessonNumber?: number | null;
        /**
         * @example 0
         */
        indexSinceAnchorSkill?: number;
        /**
         * @example "b26027e0c383f9b1ace66ec6a10dbca5"
         */
        treeId?: string;
        /**
         * @example 0
         */
        unitIndex?: number;
    };

    /**
     * @example {}
     */
    pathLevelSessionMetadata: any;

    /**
     * @example { "skillId": "...", "teachingObjective": "Use basic words", ... }
     */
    pathLevelClientData: {
        /**
         * @example "d0e863a72f45ab3a5c5145e2ad7d76e5"
         */
        skillId?: string;
        /**
         * @example ["d0e863a72f45ab3a5c5145e2ad7d76e5"]
         */
        skillIds?: string[];
        /**
         * @example 0
         */
        crownLevelIndex?: number;
        /**
         * @example null
         */
        hardModeLevelIndex?: number | null;
        /**
         * @example []
         */
        spacedRepetitionSkillIds?: string[];
        /**
         * @example 0
         */
        numPriorSRSInUnit?: number;
        /**
         * Description of what this level teaches.
         * @example "Use basic words"
         */
        teachingObjective?: string;
        /**
         * @example null
         */
        assignmentInfo?: any | null;
        /**
         * @example null
         */
        cefr?: any | null;
        /**
         * @example null
         */
        lessonNumber?: number | null;
        /**
         * @example null
         */
        practiceType?: string | null;
    };
}
