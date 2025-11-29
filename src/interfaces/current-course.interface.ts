import { PathSection } from './path-section.interface.js';

/**
 * Contains detailed progress information for the currently active course.
 * This includes the learning path structure with all units and levels.
 */
export interface CurrentCourse {
    /**
     * Assignments for this course (typically empty for regular users).
     * @example []
     */
    assignments: any[];

    /**
     * Version number for the progress tracking system.
     * @example 0
     */
    progressVersion: number;

    /**
     * Whether this course is managed in-house by Duolingo.
     * @example true
     */
    managedInHouse: boolean;

    /**
     * The subject type of the course.
     * @example "language"
     */
    subject: string;

    /**
     * Array of sections in the learning path.
     * Each section contains multiple units with their levels and progress.
     * @example [{ "index": 0, "debugName": "Path Section 0", ... }]
     */
    pathSectioned: PathSection[];
}
