// frontend/src/lib/htb-client.ts

const HTB_API_URL = "https://labs.hackthebox.com/api/v4";
const HTB_API_V5_URL = "https://labs.hackthebox.com/api/v5";

// --- Types ---

export interface HtbMachine {
    id: number;
    name: string;
    os: string;
    points: number;
    static_points: number;
    release: string;
    user_owns_count: number;
    root_owns_count: number;
    free: boolean;
    maker: {
        id: number;
        name: string;
        avatar: string;
    };
    avatar: string; // e.g. "/storage/avatars/..."
    difficulty_text: string; // Mapped from "difficultyText"
    is_completed?: boolean;
}

export interface HtbUserChallengeProgress {
    id: number;
    name: string;
    points: number;
    difficulty: string;
    challenge_category: number;
}

export interface HtbUserMachineProgress {
    id: number;
    name: string;
    os: string;
    points: number;
    avatar: string;
}

// Helper interface for Category Mapping
interface HtbCategory {
    id: number;
    name: string;
    icon: string;
}

// 1. The summary object returned by /challenge/list
export interface HtbChallengeSummary {
    id: number;
    name: string;
    challenge_category_id: number;
    difficulty: string;
    points: number;
    retired?: boolean;
}

// 2. The detail object returned by /challenge/info/{id}
export interface HtbChallengeDetail extends HtbChallengeSummary {
    description: string;
    category_name: string;
    creator_name: string;
    download: boolean;
    sha256: string;
    docker: boolean;
}

export interface HtbSolveResponse {
    success: number;
    message: string;
    incorrect?: number;
}

// Activity item from HTB API (matches bot.py structure)
export interface HtbActivityItem {
    id: number;
    object_type: "machine" | "challenge" | string;
    name: string;
    type: "user" | "root" | string; // For machines: "user" or "root"
}

// --- Helpers ---

// Helper to delay requests (Rate Limit Protection)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Functions ---

/**
 * Fetch the dictionary of Category IDs to Names
 * e.g. { 1: "Reversing", 5: "Web" }
 */
async function getChallengeCategories(
    token: string,
): Promise<Map<number, string>> {
    try {
        const res = await fetch(`${HTB_API_URL}/challenge/categories/list`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "DCC-CTF-Platform/1.0",
            },
            cache: "no-store",
        });

        if (!res.ok) return new Map();

        const data = await res.json();
        // The array is inside "info" based on API response
        const categories: HtbCategory[] = data.info || [];

        const map = new Map<number, string>();
        categories.forEach((c) => map.set(c.id, c.name));

        return map;
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return new Map();
    }
}

/**
 * Fetch a single challenge's full details using /challenge/info/{id}
 * Includes RETRY logic to handle rate limits or random failures.
 */
export async function getChallengeDetail(
    token: string,
    challengeId: number,
    retries = 3, // Default to 3 retries
): Promise<Partial<HtbChallengeDetail> | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(
                `${HTB_API_URL}/challenge/info/${challengeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "User-Agent": "DCC-CTF-Platform/1.0",
                    },
                    cache: "no-store",
                },
            );

            if (res.ok) {
                const data = await res.json();
                return data.challenge || null;
            }

            // If we get a Rate Limit (429) or Server Error (5xx), wait and retry
            if (res.status === 429 || res.status >= 500) {
                console.warn(
                    `Rate limit or error for challenge ${challengeId} (Attempt ${attempt}/${retries}). Retrying...`,
                );
                await delay(1000 * attempt); // Wait 1s, then 2s, etc.
                continue;
            }

            // If it's a 404 or 403, simply return null (don't retry)
            return null;
        } catch (error) {
            console.error(
                `Network error fetching challenge ${challengeId} (Attempt ${attempt}/${retries})`,
            );
            if (attempt === retries) return null;
            await delay(1000);
        }
    }
    return null;
}

/**
 * Fetch the list of CHALLENGES solved by a specific HTB User.
 * Uses the activity endpoint (same as bot.py) for consistency and reliability.
 */
export async function getUserChallengeProgress(
    token: string,
    htbUserId: string | number
): Promise<HtbUserChallengeProgress[]> {
    try {
        const url = `${HTB_API_URL}/user/profile/activity/${htbUserId}`;
        console.log(`Fetching Challenges for user ${htbUserId}...`); // Debug Log

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "DCC-CTF-Platform/1.0",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 404) {
                return [];
            }
            console.warn(`Failed to fetch user challenges (Status: ${res.status}). URL: ${url}`);
            return [];
        }

        const data = await res.json();
        const activities = data.profile?.activity || [];
        
        // Filter for challenges (any challenge activity counts as solved)
        const challengeActivities = activities.filter(
            (activity: HtbActivityItem) => activity.object_type === "challenge"
        );
        
        // Extract unique challenges (in case there are duplicates)
        const challengeMap = new Map<number, HtbActivityItem>();
        challengeActivities.forEach((activity: HtbActivityItem) => {
            if (!challengeMap.has(activity.id)) {
                challengeMap.set(activity.id, activity);
            }
        });
        
        // Convert to HtbUserChallengeProgress format
        return Array.from(challengeMap.values()).map((activity) => ({
            id: activity.id,
            name: activity.name,
            points: 0, // Activity doesn't include points, will need to be fetched separately if needed
            difficulty: "", // Activity doesn't include difficulty
            challenge_category: 0, // Activity doesn't include category
        }));
    } catch (error) {
        console.error("Error fetching user challenge progress:", error);
        return [];
    }
}

/**
 * Fetch user activity from HTB (matches bot.py logic).
 * Returns all activity items including machines and challenges.
 */
export async function getUserActivity(
    token: string,
    htbUserId: string | number
): Promise<HtbActivityItem[]> {
    try {
        const url = `${HTB_API_URL}/user/profile/activity/${htbUserId}`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "DCC-CTF-Platform/1.0",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 404) {
                return [];
            }
            console.warn(`Failed to fetch user activity (Status: ${res.status}). URL: ${url}`);
            return [];
        }

        const data = await res.json();
        // Activity is nested in profile.activity
        const activities = data.profile?.activity || [];
        console.log(`[HTB Client] Fetched ${activities.length} total activities for user ${htbUserId}`);
        const challengeActivities = activities.filter((a: HtbActivityItem) => a.object_type === "challenge");
        console.log(`[HTB Client] Found ${challengeActivities.length} challenge activities`);
        return activities;
    } catch (error) {
        console.error("Error fetching user activity:", error);
        return [];
    }
}

/**
 * Check if a specific challenge is solved by the user via HTB activity.
 * Returns true if the challenge ID appears in the user's activity.
 * Can optionally pass pre-fetched activities to avoid multiple API calls.
 */
export async function isChallengeSolvedViaHtb(
    token: string,
    htbUserId: string | number,
    challengeHtbId: number,
    activities?: HtbActivityItem[]
): Promise<boolean> {
    if (!challengeHtbId) return false;
    
    const activityList = activities || await getUserActivity(token, htbUserId);
    return activityList.some(
        (activity) =>
            activity.object_type === "challenge" &&
            activity.id === challengeHtbId
    );
}

/**
 * Check if a specific machine is solved (root flag) by the user via HTB activity.
 * Returns true if the machine ID has a "root" type activity (matches bot.py logic).
 * Can optionally pass pre-fetched activities to avoid multiple API calls.
 */
export async function isMachineSolvedViaHtb(
    token: string,
    htbUserId: string | number,
    machineHtbId: number,
    activities?: HtbActivityItem[]
): Promise<boolean> {
    if (!machineHtbId) return false;
    
    const activityList = activities || await getUserActivity(token, htbUserId);
    return activityList.some(
        (activity) =>
            activity.object_type === "machine" &&
            activity.id === machineHtbId &&
            activity.type === "root"
    );
}

/**
 * Fetch the list of MACHINES owned by a specific HTB User.
 * Uses the activity endpoint and filters for root flags only (matching bot.py logic).
 */
export async function getUserMachineProgress(
    token: string,
    htbUserId: string | number
): Promise<HtbUserMachineProgress[]> {
    try {
        const url = `${HTB_API_URL}/user/profile/activity/${htbUserId}`;
        console.log(`Fetching Machines for user ${htbUserId}...`); // Debug Log

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "DCC-CTF-Platform/1.0",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 404) {
                return [];
            }
            console.warn(`Failed to fetch user machines (Status: ${res.status}). URL: ${url}`);
            return [];
        }

        const data = await res.json();
        const activities = data.profile?.activity || [];
        
        // Filter for machines with root flags only (matching bot.py logic)
        const machineActivities = activities.filter(
            (activity: HtbActivityItem) =>
                activity.object_type === "machine" && activity.type === "root"
        );
        
        // Extract unique machines (in case there are duplicates)
        const machineMap = new Map<number, HtbActivityItem>();
        machineActivities.forEach((activity: HtbActivityItem) => {
            if (!machineMap.has(activity.id)) {
                machineMap.set(activity.id, activity);
            }
        });
        
        // Convert to HtbUserMachineProgress format
        return Array.from(machineMap.values()).map((activity) => ({
            id: activity.id,
            name: activity.name,
            os: "", // Activity doesn't include OS, will need to be fetched separately if needed
            points: 0, // Activity doesn't include points
            avatar: "", // Activity doesn't include avatar
        }));
    } catch (error) {
        console.error("Error fetching user machine progress:", error);
        return [];
    }
}

/**
 * Fetch ALL active machines from HTB using pagination.
 * Maps 'difficultyText' to 'difficulty_text' and fixes Avatar URLs.
 */
export async function getActiveMachines(token: string): Promise<HtbMachine[]> {
    const allMachines: HtbMachine[] = [];
    let page = 1;
    let hasNextPage = true;

    console.log("Starting HTB Machines Sync...");

    while (hasNextPage) {
        try {
            // Using API v5
            const url = `${HTB_API_V5_URL}/machines/?page=${page}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Browser User-Agent to help avoid 403s
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            // Handle 429 specifically by waiting and retrying the SAME page
            if (res.status === 429) {
                console.warn(
                    `Hit Rate Limit (429) on page ${page}. Cooling down for 60 seconds before retrying...`,
                );
                await delay(60000); // Wait 1 minute if we actually hit the limit
                continue; // Retry the same loop iteration (same page)
            }

            if (!res.ok) {
                console.error(
                    `Failed to fetch HTB Machines (Page ${page})`,
                    res.status,
                    await res.text(),
                );
                break;
            }

            const responseJson = await res.json();

            // v5 Structure: List is in 'data', Count is in 'meta.total'
            const rawList = responseJson.data || [];
            const totalRecords = responseJson.meta?.total || 0;

            if (rawList.length === 0) {
                hasNextPage = false;
                break;
            }

            // Map v5 (CamelCase) to your Interface (snake_case)
            const mappedMachines = rawList.map((m: any) => ({
                id: m.id,
                name: m.name,
                os: m.os,
                points: m.points,
                static_points: m.static_points || 0,
                release: m.releaseDate, // Map releaseDate -> release
                user_owns_count: m.userOwnsCount, // Map userOwnsCount -> user_owns_count
                root_owns_count: m.rootOwnsCount, // Map rootOwnsCount -> root_owns_count
                free: m.free,
                maker: m.firstCreator, // Map firstCreator -> maker
                avatar: m.avatar,
                difficulty_text: m.difficultyText || "Medium",
            }));

            allMachines.push(...mappedMachines);
            console.log(
                `Fetched page ${page}: ${mappedMachines.length} machines. Total so far: ${allMachines.length}`,
            );

            if (totalRecords > 0 && allMachines.length >= totalRecords) {
                hasNextPage = false;
            } else {
                page++;

                // --- 30 SECOND DELAY ---
                console.log("Waiting 10 seconds to respect rate limits...");
                await delay(10000);
            }
        } catch (error) {
            console.error("HTB API Error (Machines Loop):", error);
            hasNextPage = false;
        }
    }

    return allMachines;
}

/**
 * Fetch ALL challenges (Active + Retired) and enrich them with Details.
 * 1. Fetches Categories
 * 2. Fetches Active/Retired Lists
 * 3. Batches detailed info fetch for description/download links
 */
export async function getActiveChallenges(
    token: string,
): Promise<HtbChallengeDetail[]> {
    const headers = {
        Authorization: `Bearer ${token}`,
        "User-Agent": "DCC-CTF-Platform/1.0",
        "Content-Type": "application/json",
    };

    try {
        // 1. Fetch Categories MAP first
        console.log("Fetching Challenge Categories...");
        const categoryMap = await getChallengeCategories(token);

        // 2. Fetch Lists (Summaries)
        console.log("Fetching Challenge Lists...");
        const [resActive, resRetired] = await Promise.all([
            fetch(`${HTB_API_URL}/challenge/list`, {
                headers,
                cache: "no-store",
            }),
            fetch(`${HTB_API_URL}/challenge/list/retired`, {
                headers,
                cache: "no-store",
            }),
        ]);

        let summaries: HtbChallengeSummary[] = [];

        if (resActive.ok) {
            const data = await resActive.json();
            summaries = [...summaries, ...(data.challenges || [])];
        }

        if (resRetired.ok) {
            const data = await resRetired.json();
            const retired = (data.challenges || []).map((c: any) => ({
                ...c,
                retired: true,
            }));
            summaries = [...summaries, ...retired];
        }

        console.log(
            `Found ${summaries.length} summaries. Fetching detailed info...`,
        );

        // 3. Batch Process Details
        const fullChallenges: HtbChallengeDetail[] = [];
        const BATCH_SIZE = 5;

        for (let i = 0; i < summaries.length; i += BATCH_SIZE) {
            const batch = summaries.slice(i, i + BATCH_SIZE);

            const details = await Promise.all(
                batch.map(async (summary) => {
                    // Look up Category Name (Fallback for Summary)
                    const catName =
                        categoryMap.get(summary.challenge_category_id) ||
                        "Uncategorized";

                    await delay(150); // Rate limit guard

                    const detail = await getChallengeDetail(token, summary.id);

                    if (detail) {
                        return {
                            ...summary,
                            ...detail, // Merges description, sha256, etc.
                            // Prefer detail category name if available, else use map
                            category_name: detail.category_name || catName,
                            // Ensure points/difficulty fallback
                            difficulty: detail.difficulty || summary.difficulty,
                            points: detail.points || summary.points,
                            // Robust description check
                            description:
                                detail.description ||
                                "No description provided by author.",
                        } as HtbChallengeDetail;
                    }

                    // Fallback if detail fetch fails completely (after retries)
                    return {
                        ...summary,
                        category_name: catName,
                        description:
                            "Description unavailable (Sync Error). Check logs.",
                        download: false,
                        sha256: "",
                    } as HtbChallengeDetail;
                }),
            );

            fullChallenges.push(...details);
            console.log(
                `Synced ${fullChallenges.length} / ${summaries.length}...`,
            );
        }

        return fullChallenges;
    } catch (error) {
        console.error("HTB API Error (Challenges):", error);
        return [];
    }
}

/**
 * Submit a flag to HTB on behalf of a user.
 */
export async function submitHtbFlag(
    token: string,
    targetId: number,
    flag: string,
    type: "machine" | "challenge",
): Promise<{ success: boolean; message: string }> {
    const endpoint = type === "machine" ? "/machine/own" : "/challenge/own";

    try {
        const res = await fetch(`${HTB_API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "User-Agent": "DCC-CTF-Platform/1.0",
            },
            body: JSON.stringify({
                id: targetId,
                flag: flag,
            }),
        });

        const data = (await res.json()) as HtbSolveResponse;

        if (data.success === 1) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("HTB Submission Error:", error);
        return {
            success: false,
            message: "Failed to contact HackTheBox servers.",
        };
    }
}