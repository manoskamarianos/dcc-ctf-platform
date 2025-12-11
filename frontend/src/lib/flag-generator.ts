import { createHash } from "crypto";

/**
 * Generates a deterministic unique flag for a specific user and challenge.
 *
 * Rules:
 * 1. If the template contains "{hash}", it replaces it with a unique 8-char signature.
 * 2. If NO "{hash}" is found, it returns the flag exactly as is (Static Flag).
 */
export function generateUserFlag(
    flagTemplate: string,
    serverSeed: string,
    userId: string,
): string {
    // Check if dynamic hashing is requested
    if (!flagTemplate.includes("{hash}")) {
        // No placeholder? Return static flag.
        return flagTemplate;
    }

    // 1. Create a unique signature based on User ID and the Challenge's Secret Seed
    const signature = createHash("sha256")
        .update(`${userId}-${serverSeed}`)
        .digest("hex");

    // 2. Take the first 8 characters
    const uniqueHash = signature.substring(0, 8);

    // 3. Replace the placeholder
    return flagTemplate.replace("{hash}", uniqueHash);
}
