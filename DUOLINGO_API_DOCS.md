# Duolingo API Fields Documentation

This document lists useful fields found in the Duolingo API responses (specifically the user profile JSON) that can be used for further scraping or analysis.

## User Profile (`/users/<id>?fields=...`)

### Core Stats
- `gems`: Total gems (e.g., `5500`).
- `streak`: Current streak count (e.g., `1416`).
- `xp`: Total XP (found in `courses` objects).
- `username`: User's handle.
- `name`: Display name.

### Courses (`courses` array)
Each object in the `courses` array represents a language being learned.
- `title`: Language name (e.g., "Esperanto", "Turkish").
- `id`: Course ID (e.g., `DUOLINGO_EO_EN`).
- `xp`: XP earned in this course.
- `learningLanguage`: ISO code of target language (e.g., `eo`).
- `fromLanguage`: ISO code of source language (e.g., `en`).

### Current Course (`currentCourse`)
Contains detailed progress for the currently active course.
- `pathSectioned`: Array of sections in the learning path.
    - `units`: Array of units within a section.
        - `teachingObjective`: Description of the unit (e.g., "Talk about events").
        - `guidebook.url`: URL to the guidebook JSON.
        - `levels`: Array of levels within a unit.
            - `state`: Status of the level (e.g., `legendary`, `completed`, `active`, `locked`).
            - `finishedSessions`: Number of sessions completed.
            - `totalSessions`: Total sessions required.
            - `pathLevelMetadata.nodeState`: Detailed state (e.g., `legendary`).

### Leaderboard / League
- `leaderboard`: Contains active contest info.
    - `active_contest.tier`: League tier index.
        - 0: Bronze
        - 1: Silver
        - 2: Gold
        - 3: Sapphire
        - 4: Ruby
        - 5: Emerald
        - 6: Amethyst
        - 7: Pearl
        - 8: Obsidian
        - 9: Diamond
    - `active_contest.contest_state`: e.g., `ACTIVE`.

### Shop / Inventory
- `shopItems`: Array of purchased or available items.
    - `itemName`: e.g., `streak_freeze`, `formal_outfit`.
    - `purchasePrice`: Cost in gems.

### Social
- `num_followers`: Follower count.
- `num_following`: Following count.

### Daily Quests
(Note: Text descriptions like "Earn 10 XP" were not found in the main profile JSON, but quest status might be inferred from `rewards` or specific quest endpoints if available).
