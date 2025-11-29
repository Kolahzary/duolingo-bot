import { UserData } from './user-data.interface.js';
import { LeaderboardData } from './leaderboard-data.interface.js';

/**
 * Represents the collection of useful data captured from network logs.
 */
export interface NetworkLogs {
    /**
     * The user profile data captured from /users/<id> endpoint.
     */
    userData: UserData | null;

    /**
     * The leaderboard data captured from /leaderboards/<id> endpoint.
     */
    leaderboardData: LeaderboardData | null;
}
