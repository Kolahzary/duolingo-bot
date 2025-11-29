import { NetworkLogs, Unit, Level } from '../interfaces';

export function getGems(logs: NetworkLogs): string {
    return logs.userData?.gemsConfig?.gems?.toString() ?? 'Unknown';
}

export function getStreak(logs: NetworkLogs): string {
    return logs.userData?.streak?.toString() ?? 'Unknown';
}

export function getAvailableLanguages(logs: NetworkLogs): string[] {
    const userData = logs.userData;
    if (!userData?.courses) return [];

    return userData.courses
        .filter((c: any) => c.learningLanguage !== c.fromLanguage)
        .map((c: any) => c.title)
        .filter((t: any) => t);
}

export function getCurrentLanguage(logs: NetworkLogs): string {
    const userData = logs.userData;
    if (!userData) return 'Unknown';

    // Primary source: Current course title
    if (userData.currentCourse && userData.courses) {
        // userData.learningLanguage matches the current course's learningLanguage
        const current = userData.courses.find((c: any) => c.learningLanguage === userData.learningLanguage);
        if (current) return current.title || 'Unknown';
    }

    return userData.learningLanguage || 'Unknown';
}

export function getCurrentLeague(logs: NetworkLogs): string {
    // Primary source: Leaderboard data tier
    if (logs.leaderboardData?.tier !== undefined) {
        return logs.leaderboardData.tier.toString();
    }

    return 'Unknown';
}

export function getDailyQuests(logs: NetworkLogs): any[] {
    return [];
}

export function getSkillPath(logs: NetworkLogs): any[] {
    const userData = logs.userData;
    if (!userData?.currentCourse?.pathSectioned) return [];

    const units: any[] = [];
    let unitCounter = 1;

    userData.currentCourse.pathSectioned.forEach((section: any) => {
        if (!section.units) return;

        section.units.forEach((unit: Unit) => {
            let title = unit.teachingObjective || 'Unknown';

            // Handle special cases that are not strictly fallbacks but data structure variants
            if (title === 'Unknown') {
                if (unit.guidebook?.url) {
                    title = 'Guidebook Available';
                } else if (unit.levels?.length > 0) {
                    const firstLevel: any = unit.levels[0];
                    // Daily Refresh is a specific unit type
                    if (firstLevel.dailyRefreshInfo || (firstLevel.debugName && firstLevel.debugName.includes('Daily Refresh'))) {
                        title = 'Daily Refresh';
                    } else {
                        // Use level info if unit title is missing (common in some course structures)
                        title = firstLevel.teachingObjective || firstLevel.name || 'Unknown';
                    }
                }
            }

            const levels = unit.levels ? unit.levels.map((level: Level) => ({
                state: level.state,
                finishedSessions: level.finishedSessions,
                totalSessions: level.totalSessions
            })) : [];

            units.push({
                number: unitCounter++,
                title: title,
                levels: levels
            });
        });
    });

    return units;
}
