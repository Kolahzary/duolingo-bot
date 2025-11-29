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

export function getCurrentLanguageISO(logs: NetworkLogs): string {
    const userData = logs.userData;
    if (!userData) return 'unknown';

    return userData.learningLanguage || 'unknown';
}

export function getCurrentLeague(logs: NetworkLogs): string {
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

export function getTodaysStreakCompleted(logs: NetworkLogs): boolean {
    const userData = logs.userData;
    if (!userData?.streakData?.currentStreak?.lastExtendedDate) {
        return false;
    }

    // Get today's date in YYYY-MM-DD format
    // Use the user's timezone offset if available
    const now = new Date();
    const timezoneOffset = userData.timezoneOffset;

    // If we have timezone info, adjust accordingly
    // timezoneOffset is in format like "+0300" or "-0500"
    let todayStr: string;
    if (timezoneOffset) {
        // Parse offset (e.g., "+0300" -> 3 hours)
        const sign = timezoneOffset[0] === '+' ? 1 : -1;
        const hours = parseInt(timezoneOffset.slice(1, 3));
        const minutes = parseInt(timezoneOffset.slice(3, 5));
        const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;

        // Get UTC time and apply user's offset
        const userTime = new Date(now.getTime() + offsetMs);
        todayStr = userTime.toISOString().split('T')[0];
    } else {
        // Fallback to local date
        todayStr = now.toISOString().split('T')[0];
    }

    return userData.streakData.currentStreak.lastExtendedDate === todayStr;
}

/**
 * Select a language from the courses menu
 * @param page - Playwright page object
 * @param languageName - Full name of the language (e.g., "Turkish", "Spanish")
 */
export async function selectLanguage(page: any, languageName: string): Promise<void> {
    // Hover on the courses menu to show dropdown
    const coursesMenu = page.locator('[data-test="courses-menu"]');
    await coursesMenu.waitFor({ timeout: 10000 });
    await coursesMenu.hover();
    await page.waitForTimeout(1500);

    // Find and click the language
    const languageOption = page.getByText(languageName, { exact: true });
    await languageOption.click();
    await page.waitForTimeout(2000);
}
