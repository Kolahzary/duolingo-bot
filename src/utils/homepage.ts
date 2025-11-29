import { Page } from 'playwright';

export interface DailyQuest {
    title: string;
    value: string;
    isCompleted: boolean;
}

export interface Level {
    number: number;
    link: string;
    state: string;
}

export interface Unit {
    number: number;
    title: string;
    levels: Level[];
}

export function getGems(userData: any): string {
    try {
        if (userData.gems) return userData.gems.toString();
        if (userData.gemsConfig && userData.gemsConfig.gems) return userData.gemsConfig.gems.toString();
        return 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

export function getStreak(userData: any): string {
    try {
        return userData.streak?.toString() || 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

export function getAvailableLanguages(userData: any): string[] {
    try {
        if (userData.courses && Array.isArray(userData.courses)) {
            return userData.courses.map((c: any) => c.title).filter((t: any) => t);
        }
        return [];
    } catch (e) {
        console.error('Error fetching languages:', e);
        return [];
    }
}

export function getCurrentLanguage(userData: any): string {
    try {
        const currentCourseId = userData.currentCourseId;
        if (currentCourseId && userData.courses) {
            const course = userData.courses.find((c: any) => c.id === currentCourseId);
            if (course) {
                return course.title;
            }
        }
        return 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

export function getCurrentLeague(userData: any): string {
    try {
        let tier = -1;
        if (userData.leaderboard?.active_contest?.tier !== undefined) {
            tier = userData.leaderboard.active_contest.tier;
        } else if (userData.tier !== undefined) {
            tier = userData.tier;
        }

        if (tier !== -1) {
            return tier.toString();
        }

        // Fallback: check tracking properties
        if (userData.trackingProperties?.cohort_tier !== undefined) {
            return userData.trackingProperties.cohort_tier.toString();
        }

        return 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

export function getDailyQuests(userData: any): DailyQuest[] | string {
    // Daily quests text was not found in the main profile JSON.
    // Returning empty for now as per plan note.
    return [];
}

export function getSkillPath(userData: any): Unit[] {
    try {
        const units: Unit[] = [];
        const currentCourse = userData.currentCourse;
        if (!currentCourse || !currentCourse.pathSectioned) return [];

        const pathSections = currentCourse.pathSectioned;

        let globalUnitIndex = 1; // 1-based index for URL

        for (const section of pathSections) {
            if (!section.units) continue;

            for (const unit of section.units) {
                // Title
                // Use teachingObjective from the unit if available
                let title = unit.teachingObjective || 'Unknown';

                // Fallback: Check first level if unit title is missing
                if (title === 'Unknown' && unit.levels && unit.levels.length > 0) {
                    const firstLevel = unit.levels[0];
                    title = firstLevel.teachingObjective || firstLevel.name || 'Unknown';
                }

                // Fallback: Guidebook
                if (title === 'Unknown' && unit.guidebook?.url) {
                    title = 'Guidebook Available';
                }

                // Fallback: Daily Refresh
                if (title === 'Unknown' && unit.levels && unit.levels.length > 0) {
                    const firstLevel = unit.levels[0];
                    if (firstLevel.dailyRefreshInfo || (firstLevel.debugName && firstLevel.debugName.includes('Daily Refresh'))) {
                        title = 'Daily Refresh';
                    }
                }

                const levels: Level[] = [];
                if (unit.levels) {
                    for (let i = 0; i < unit.levels.length; i++) {
                        const level = unit.levels[i];
                        // Construct link
                        const link = `https://www.duolingo.com/lesson/unit/${globalUnitIndex}/level/${i + 1}`;

                        // State
                        const state = level.state || 'Unknown';

                        levels.push({
                            number: i + 1,
                            link: link,
                            state: state
                        });
                    }
                }

                units.push({
                    number: globalUnitIndex, // Use the running count
                    title: title,
                    levels: levels
                });

                globalUnitIndex++;
            }
        }

        return units;

    } catch (e) {
        console.error('Error parsing skill path:', e);
        return [];
    }
}
