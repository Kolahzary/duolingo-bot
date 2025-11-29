import { Course } from './course.interface.js';
import { CurrentCourse } from './current-course.interface.js';

/**
 * Represents the complete user profile data from the Duolingo API.
 * Retrieved from the `/users/<id>?fields=...` endpoint.
 */
export interface UserData {
    /**
     * Whether the user has linked a Facebook account.
     * @example false
     */
    hasFacebookId: boolean;

    /**
     * @example true
     */
    emailSchoolsPromotion: boolean;

    /**
     * @example { "disable_clubs": false, "skill_tree_id": "...", ... }
     */
    trackingProperties: {
        /**
         * @example false
         */
        disable_clubs: boolean;
        /**
         * @example "b26027e0c383f9b1ace66ec6a10dbca5"
         */
        skill_tree_id: string;
        /**
         * @example false
         */
        disable_social: boolean;
        /**
         * @example true
         */
        notification_sms_enabled: boolean;
        /**
         * @example false
         */
        has_item_weekend_amulet: boolean;
        /**
         * @example null
         */
        beta_shake_to_report_enabled: any | null;
        /**
         * @example 153120819985
         */
        creation_age: number;
        /**
         * @example "2021-01-22T15:34:45"
         */
        creation_date_new: string;
        /**
         * @example false
         */
        has_item_gold_subscription: boolean;
        /**
         * @example "eo"
         */
        learning_language: string;
        /**
         * @example false
         */
        has_item_streak_wager: boolean;
        /**
         * @example "INELIGIBLE"
         */
        beta_enrollment_status: string;
        /**
         * @example false
         */
        disable_discussions: boolean;
        /**
         * @example null
         */
        placement_depth: any | null;
        /**
         * @example 10393
         */
        num_sessions_completed: number;
        /**
         * @example 20
         */
        goal: number;
        /**
         * @example 12
         */
        level: number;
        /**
         * @example false
         */
        disable_friends_quests: boolean;
        /**
         * @example false
         */
        disable_leaderboards: boolean;
        /**
         * @example 1416
         */
        streak: number;
        /**
         * @example "friendsOrFamily"
         */
        acquisition_survey_reason: string;
        /**
         * @example false
         */
        notification_wechat_enabled: boolean;
        /**
         * @example false
         */
        disable_third_party_tracking: boolean;
        /**
         * @example false
         */
        notification_whatsapp_enabled: boolean;
        /**
         * @example false
         */
        has_item_immersive_subscription: boolean;
        /**
         * @example 5500
         */
        gems: number;
        /**
         * @example 6
         */
        num_item_streak_freeze_total: number;
        /**
         * @example 123456789
         */
        user_id: number;
        /**
         * @example 123456789
         */
        distinct_id: number;
        /**
         * @example false
         */
        disable_personalized_ads: boolean;
        /**
         * @example 3
         */
        utc_offset: number;
        /**
         * @example "eo"
         */
        course_topic_id: string;
        /**
         * @example true
         */
        has_picture: boolean;
        /**
         * @example false
         */
        has_item_live_subscription: boolean;
        /**
         * @example false
         */
        is_age_restricted: boolean;
        /**
         * @example null
         */
        placement_section_index: any | null;
        /**
         * @example 119
         */
        num_followers: number;
        /**
         * @example null
         */
        prior_proficiency_onboarding: any | null;
        /**
         * @example false
         */
        trial_account: boolean;
        /**
         * @example false
         */
        disable_stream: boolean;
        /**
         * @example "language"
         */
        course_subject: string;
        /**
         * @example true
         */
        has_item_premium_subscription: boolean;
        /**
         * @example 92
         */
        num_following: number;
        /**
         * @example false
         */
        disable_kudos: boolean;
        /**
         * @example 1611329685946
         */
        creation_date_millis: number;
        /**
         * @example "eo<-en"
         */
        direction: string;
        /**
         * @example false
         */
        disable_profile_country: boolean;
        /**
         * @example "DUOLINGO_EO_EN"
         */
        course_id: string;
        /**
         * @example false
         */
        has_item_rupee_wager: boolean;
        /**
         * @example 5
         */
        num_item_streak_freeze: number;
        /**
         * @example true
         */
        has_item_streak_freeze: boolean;
        /**
         * @example "TRAVEL"
         */
        learning_reason: string;
        /**
         * @example "paid_subscription_owner_super"
         */
        monetizable_status: string;
        /**
         * @example false
         */
        disable_events: boolean;
        /**
         * @example false
         */
        disable_mature_words: boolean;
        /**
         * @example false
         */
        disable_ads_and_tracking_consent: boolean;
        /**
         * @example false
         */
        china_social_restricted: boolean;
        /**
         * Current league tier index.
         * League tiers: 0=Bronze, 1=Silver, 2=Gold, 3=Sapphire, 4=Ruby, 5=Emerald, 6=Amethyst, 7=Pearl, 8=Obsidian, 9=Diamond
         * @example 8
         */
        leaderboard_league: number;
        /**
         * @example 9
         */
        cohort_tier?: number;
        /**
         * @example false
         */
        age_restricted: boolean;
        /**
         * @example false
         */
        disable_immersion: boolean;
        /**
         * @example false
         */
        disable_shared_streak: boolean;
        /**
         * @example "en"
         */
        ui_language: string;
        /**
         * @example "john_doe"
         */
        username: string;
    };

    /**
     * @example true
     */
    animationEnabled: boolean;

    /**
     * Total XP (experience points) earned across all courses.
     * @example 332176
     */
    totalXp: number;

    /**
     * @example "+0300"
     */
    timezoneOffset: string;

    /**
     * @example "https://invite.duolingo.com/..."
     */
    inviteURL: string;

    /**
     * @example 123456789
     */
    id: number;

    /**
     * Array of web notification IDs.
     * @example ["ev_123456789", ...]
     */
    webNotificationIds: string[];

    /**
     * Gems configuration and balance.
     * @example { "gems": 5500, "gemsPerSkill": 25, "useGems": true }
     */
    gemsConfig: {
        /**
         * Total gems (virtual currency) available.
         * @example 5500
         */
        gems: number;
        /**
         * Gems earned per skill completion.
         * @example 25
         */
        gemsPerSkill: number;
        /**
         * Whether gems are enabled for this user.
         * @example true
         */
        useGems: boolean;
    };

    /**
     * @example true
     */
    emailClassroomJoin: boolean;

    /**
     * @example true
     */
    emailClassroomLeave: boolean;

    /**
     * @example true
     */
    emailSchoolsNewsletter: boolean;

    /**
     * @example true
     */
    emailSchoolsAnnouncement: boolean;

    /**
     * @example "friendsOrFamily"
     */
    acquisitionSurveyReason: string;

    /**
     * @example true
     */
    emailEditSuggested: boolean;

    /**
     * @example 10
     */
    xpGoal: number;

    /**
     * @example { "de": { ... }, "ru": { ... }, ... }
     */
    practiceReminderSettings: any;

    /**
     * @example [{ "rewards": [...], "id": "...", ... }]
     */
    rewardBundles: any[];

    /**
     * Array of blocked user IDs.
     * @example [111111111, 222222222]
     */
    blockedUserIds: number[];

    /**
     * @example true
     */
    emailAnnouncement: boolean;

    /**
     * Current streak count (consecutive days of practice).
     * @example 1416
     */
    streak: number;

    /**
     * @example 1611329685
     */
    creationDate: number;

    /**
     * @example true
     */
    emailPass: boolean;

    /**
     * @example true
     */
    enableMicrophone: boolean;

    /**
     * User's display name.
     * @example "John Doe"
     */
    name: string;

    /**
     * @example true
     */
    emailResearch: boolean;

    /**
     * @example true
     */
    enableSoundEffects: boolean;

    /**
     * @example [{ "status": "AVAILABLE", "id": "levels_opt_in_v1" }, ...]
     */
    optionalFeatures: Array<{
        /**
         * @example "AVAILABLE"
         */
        status: string;
        /**
         * @example "levels_opt_in_v1"
         */
        id: string;
    }>;

    /**
     * Array of all courses the user is learning or has learned.
     * Each object represents a language course with progress information.
     * @example [{ "placementTestAvailable": false, "title": "Esperanto", ... }]
     */
    courses: Course[];

    /**
     * Detailed information about the currently active course.
     * Contains the full learning path with units, levels, and progress.
     * @example { "assignments": [], "pathSectioned": [...], ... }
     */
    currentCourse: CurrentCourse;

    /**
     * @example "DUOLINGO_EO_EN"
     */
    currentCourseId: string;

    /**
     * @example "eo"
     */
    learningLanguage: string;

    /**
     * Total gems (virtual currency) available.
     * Same value as gemsConfig.gems.
     * @example 5500
     */
    gems: number;

    /**
     * @example "..."
     */
    bio?: string;

    /**
     * @example "..."
     */
    location?: string;

    /**
     * User's unique username/handle.
     * @example "john_doe"
     */
    username: string;

    /**
     * @example "..."
     */
    picture?: string;

    /**
     * @example "..."
     */
    profileCountry?: string;

    /**
     * @example "..."
     */
    plusStatus?: string;

    /**
     * @example ["..."]
     */
    roles?: string[];

    /**
     * @example "..."
     */
    email?: string;

    /**
     * @example "..."
     */
    phoneNumber?: string;

    /**
     * @example false
     */
    hasGoogleId?: boolean;

    /**
     * @example { ... }
     */
    privacySettings?: any;

    /**
     * @example { "currentStreak": 1416, ... }
     */
    streakData?: {
        /**
         * @example 1416
         */
        currentStreak: number;
    };

    /**
     * @example false
     */
    subscriber?: boolean;
}
