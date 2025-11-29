import { Page } from 'playwright';

export interface DailyQuest {
    title: string;
    value: string;
    isCompleted: boolean;
}

export async function getGems(page: Page): Promise<string> {
    try {
        return await page.locator('[data-test="lingot-stat"]').innerText();
    } catch (e) {
        return 'Unknown';
    }
}

export async function getStreak(page: Page): Promise<string> {
    try {
        return await page.locator('[data-test="streak-stat"]').innerText();
    } catch (e) {
        return 'Unknown';
    }
}

export async function getAvailableLanguages(page: Page): Promise<string[] | string> {
    try {
        // Hover over course menu to reveal languages
        const coursesMenu = page.locator('[data-test="courses-menu"]');
        await coursesMenu.hover();

        // Wait for menu to appear
        await page.waitForTimeout(1000);

        const myCoursesHeader = page.getByText('My courses');
        if (await myCoursesHeader.isVisible()) {
            const menuContainer = myCoursesHeader.locator('..').locator('..'); // Go up a bit
            const menuText = await menuContainer.innerText();

            const lines = menuText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            // Filter out "My courses", "Add a new course", etc.
            return lines.filter(l =>
                l.toUpperCase() !== 'MY COURSES' &&
                l !== 'Add a new course' &&
                !l.match(/^\d+$/) && // XP or other numbers
                !l.match(/XP/) // XP text
            );
        } else {
            return "Menu not found after hover";
        }
    } catch (e) {
        console.error('Error fetching languages:', e);
        return 'Error fetching languages';
    }
}

export async function getCurrentLanguage(page: Page): Promise<string> {
    try {
        const pageTitle = await page.title();
        // Format: "Duolingo - Learn Turkish with lessons that work"
        const titleMatch = pageTitle.match(/Learn (.+) with/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1];
        } else {
            return pageTitle; // Fallback
        }
    } catch (e) {
        return 'Unknown';
    }
}

export async function getCurrentLeague(page: Page): Promise<string> {
    try {
        // Look for "League" text
        return await page.getByText(/League/).first().innerText();
    } catch (e) {
        return 'Unknown';
    }
}

export async function getDailyQuests(page: Page): Promise<DailyQuest[] | string> {
    try {
        const quests: DailyQuest[] = [];
        // Find the header "Daily Quests"
        const questsHeader = page.getByText('Daily Quests');
        if (await questsHeader.isVisible()) {
            // Top-down approach
            const parent = questsHeader.locator('..');
            // Get grandparent container (likely the module wrapper)
            const moduleContainer = parent.locator('..');

            const containerText = await moduleContainer.innerText();
            const lines = containerText.split('\n').map(s => s.trim()).filter(s => s.length > 0);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.match(/^\d+\s*\/\s*\d+$/)) {
                    const value = line;
                    // Title is likely i-1
                    let title = 'Unknown';
                    if (i > 0) {
                        title = lines[i - 1];
                    }

                    // Ignore if title looks like progress (duplicate entry)
                    if (title.match(/^\d+\s*\/\s*\d+$/)) {
                        continue;
                    }

                    const [current, total] = value.split('/').map(s => parseInt(s.trim()));
                    const isCompleted = current >= total;

                    quests.push({
                        title: title,
                        value: value,
                        isCompleted: isCompleted
                    });
                }
            }

            // Deduplicate by title
            return quests.filter((q, index, self) =>
                index === self.findIndex((t) => (
                    t.title === q.title
                ))
            );

        } else {
            return "Header not found";
        }
    } catch (e) {
        console.error('Error parsing quests:', e);
        return 'Error parsing';
    }
}

export interface Level {
    number: number;
    link: string;
}

export interface Unit {
    number: number;
    header: string;
    levels: Level[];
}

export async function getSkillPath(page: Page): Promise<Unit[]> {
    try {
        const units: Unit[] = [];
        const unitElements = await page.locator('[data-test^="skill-path-unit-"]').all();

        for (const unitEl of unitElements) {
            const dataTest = await unitEl.getAttribute('data-test');
            if (!dataTest) continue;

            // Extract unit number from "skill-path-unit-X"
            // Note: data-test might contain multiple classes, but usually starts with the ID
            // Regex to find "skill-path-unit-\d+"
            const unitMatch = dataTest.match(/skill-path-unit-(\d+)/);
            if (!unitMatch) continue;

            const unitNumber = parseInt(unitMatch[1]);

            // Header
            let header = 'Unknown';
            try {
                header = await unitEl.locator('header h2').innerText();
            } catch (e) {
                // Header might be missing or different structure
            }

            // Levels
            const levels: Level[] = [];
            // Find levels inside this unit
            // We need to be careful not to find levels of nested units if any (unlikely)
            // But locator inside locator should be safe.
            const levelElements = await unitEl.locator('[data-test*="skill-path-level-"]').all();

            for (const levelEl of levelElements) {
                const levelDataTest = await levelEl.getAttribute('data-test');
                if (!levelDataTest) continue;

                // Extract level number from "skill-path-level-X"
                const levelMatch = levelDataTest.match(/skill-path-level-(\d+)/);
                if (!levelMatch) continue;

                const levelNumber = parseInt(levelMatch[1]);

                // Construct link
                // Assumption: Unit is 1-based in URL, Level is 1-based in URL
                // Unit ID from data-test seems to be 0-based (unit-0 is likely Unit 1)
                // Level ID from data-test seems to be 0-based (level-0 is likely Level 1)
                const link = `https://www.duolingo.com/lesson/unit/${unitNumber + 1}/level/${levelNumber + 1}`;

                levels.push({
                    number: levelNumber,
                    link: link
                });
            }

            units.push({
                number: unitNumber,
                header: header,
                levels: levels
            });
        }

        return units;

    } catch (e) {
        console.error('Error parsing skill path:', e);
        return [];
    }
}
