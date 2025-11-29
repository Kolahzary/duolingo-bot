/**
 * Represents leaderboard and league competition data from the Duolingo API.
 * Retrieved from the `/leaderboards/<id>` endpoint.
 * Contains information about the user's current league tier, contest status, and competition history.
 */
export interface LeaderboardData {
    /**
     * Active leaderboard data (alternative structure, typically null).
     * @example null
     */
    active: any | null;

    /**
     * Array of ended contests.
     * @example []
     */
    ended: any[];

    /**
     * Main leaderboard object containing active contest and ruleset information.
     * @example { "active_contest": { ... }, "next_contest_start": "2025-11-30T10:00:00Z", "ruleset": { ... } }
     */
    leaderboard: {
        /**
         * Information about the currently active league contest.
         * @example { "contest_end": "2025-11-30T10:00:00Z", "contest_id": "12345678-abcd-1234-abcd-123456789abc", ... }
         */
        active_contest: {
            /**
             * @example "2025-11-30T10:00:00Z"
             */
            contest_end: string;
            /**
             * Unique identifier for this contest.
             * @example "12345678-abcd-1234-abcd-123456789abc"
             */
            contest_id: string;
            /**
             * @example "2025-11-23T10:00:00Z"
             */
            contest_start: string;
            /**
             * Current state of the contest.
             * Possible values: 'ACTIVE', 'ENDED'
             * @example "ACTIVE"
             */
            contest_state: string;
            /**
             * @example 11
             */
            offset_bucket: number;
            /**
             * @example null
             */
            platform: any | null;
            /**
             * @example "2025-11-29T10:00:00Z"
             */
            registration_end: string;
            /**
             * @example "CLOSED"
             */
            registration_state: string;
            /**
             * Rules and configuration for this contest.
             * Defines promotion/demotion criteria, rewards, and cohort settings.
             * @example { "cohort_size": 15, "cohort_type": "RANDOM", ... }
             */
            ruleset: {
                /**
                 * @example 15
                 */
                cohort_size: number;
                /**
                 * @example "RANDOM"
                 */
                cohort_type: string;
                /**
                 * @example null
                 */
                goals: any | null;
                /**
                 * @example [5, 5]
                 */
                num_demoted: number[];
                /**
                 * @example 5
                 */
                num_losers: number;
                /**
                 * @example [10, 10]
                 */
                num_promoted: number[];
                /**
                 * @example 10
                 */
                num_winners: number;
                /**
                 * @example [{ "expiration": "None", "item_id": null, ... }]
                 */
                rewards: Array<{
                    /**
                     * @example "None"
                     */
                    expiration: string;
                    /**
                     * @example null
                     */
                    item_id: string | null;
                    /**
                     * @example null
                     */
                    item_name: string | null;
                    /**
                     * @example 8
                     */
                    item_quantity: number;
                    /**
                     * @example 0
                     */
                    rank: number;
                    /**
                     * @example []
                     */
                    rank_range: number[];
                    /**
                     * @example "CURRENCY"
                     */
                    reward_type: string;
                    /**
                     * @example 0
                     */
                    tier: number;
                }>;
                /**
                 * Type of score used for ranking.
                 * Typically 'XP' for experience points.
                 * @example "XP"
                 */
                score_type: string;
                /**
                 * @example true
                 */
                tiered: boolean;
                /**
                 * @example 0
                 */
                winner_break_period: number;
            };
        };
        /**
         * @example "2025-11-30T10:00:00Z"
         */
        next_contest_start: string;
        /**
         * @example { "cohort_size": 15, "cohort_type": "RANDOM", ... }
         */
        ruleset: {
            /**
             * @example 15
             */
            cohort_size: number;
            /**
             * @example "RANDOM"
             */
            cohort_type: string;
            /**
             * @example null
             */
            goals: any | null;
            /**
             * @example [5, 5]
             */
            num_demoted: number[];
            /**
             * @example 5
             */
            num_losers: number;
            /**
             * @example [10, 10]
             */
            num_promoted: number[];
            /**
             * @example 10
             */
            num_winners: number;
            /**
             * @example [{ "expiration": "None", "item_id": null, ... }]
             */
            rewards: Array<{
                /**
                 * @example "None"
                 */
                expiration: string;
                /**
                 * @example null
                 */
                item_id: string | null;
                /**
                 * @example null
                 */
                item_name: string | null;
                /**
                 * @example 8
                 */
                item_quantity: number;
                /**
                 * @example 0
                 */
                rank: number;
                /**
                 * @example []
                 */
                rank_range: number[];
                /**
                 * @example "CURRENCY"
                 */
                reward_type: string;
                /**
                 * @example 0
                 */
                tier: number;
            }>;
            /**
             * @example "XP"
             */
            score_type: string;
            /**
             * @example true
             */
            tiered: boolean;
            /**
             * @example 0
             */
            winner_break_period: number;
        };
    };

    /**
     * @example 0
     */
    num_sessions_remaining_to_unlock: number;

    /**
     * @example 1
     */
    num_wins: number;

    /**
     * @example { "last_win_contest_end": "2024-04-14T10:00:00Z", "num_wins": 1, ... }
     */
    stats: {
        /**
         * @example "2024-04-14T10:00:00Z"
         */
        last_win_contest_end: string;
        /**
         * @example 1
         */
        num_wins: number;
        /**
         * @example 0
         */
        number_one_finishes: number;
        /**
         * @example 0
         */
        number_two_finishes: number;
        /**
         * @example 0
         */
        streak_in_tier: number;
        /**
         * @example 3
         */
        top_three_finishes: number;
    };

    /**
     * @example 0
     */
    streak_in_tier: number;

    /**
     * Current league tier index.
     * League tiers: 0=Bronze, 1=Silver, 2=Gold, 3=Sapphire, 4=Ruby, 5=Emerald, 6=Amethyst, 7=Pearl, 8=Obsidian, 9=Diamond
     * @example 1
     */
    tier: number;

    /**
     * @example 3
     */
    top_three_finishes: number;
}
