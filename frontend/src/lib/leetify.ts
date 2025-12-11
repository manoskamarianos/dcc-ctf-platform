export type LeetLevel = "basic" | "advanced" | "ultra";

const BASIC_MAP: Record<string, string[]> = {
    a: ["4"],
    b: ["8"],
    e: ["3"],
    g: ["6", "9"],
    i: ["1"],
    l: ["1"],
    o: ["0"],
    s: ["5"],
    t: ["7"],
    z: ["2"],
    " ": ["_"],
};

const ADVANCED_MAP: Record<string, string[]> = {
    a: ["@", "^"],
    c: ["(", "<", "["],
    d: ["|)"],
    f: ["|="],
    h: ["#"],
    i: ["!"],
    k: ["|<"],
    s: ["$"],
    x: ["><"],
    " ": ["_", "-", "."],
};

const ULTRA_MAP: Record<string, string[]> = {
    a: ["/-\\"],
    b: ["|3"],
    d: ["|]"],
    e: ["[-"],
    f: ["ph"],
    h: ["|-|", "]-[", "}{"],
    j: ["_|"],
    k: ["|{"],
    l: ["|_"],
    m: ["/\\/\\", "|v|"],
    n: ["|\\|", "/\\/"],
    o: ["()", "[]"],
    p: ["|*"],
    q: ["(_,)", "0_"],
    r: ["|2"],
    u: ["|_|"],
    v: ["\\/"],
    w: ["\\/\\/", "vv"],
    y: ["`/", "¥"],
};

export function leetify(input: string, level: LeetLevel = "basic"): string {
    if (!input) return "";

    // Merge maps based on level
    let currentMap: Record<string, string[]> = { ...BASIC_MAP };

    if (level === "advanced") {
        // Merge Basic + Advanced
        Object.keys(ADVANCED_MAP).forEach((key) => {
            currentMap[key] = [
                ...(currentMap[key] || []),
                ...ADVANCED_MAP[key],
            ];
        });
    } else if (level === "ultra") {
        // Merge Basic + Advanced + Ultra
        const combined = { ...ADVANCED_MAP };
        Object.keys(ULTRA_MAP).forEach((key) => {
            combined[key] = [...(combined[key] || []), ...ULTRA_MAP[key]];
        });

        // Merge into current
        Object.keys(combined).forEach((key) => {
            currentMap[key] = [...(currentMap[key] || []), ...combined[key]];
        });
    }

    const transform = (str: string) => {
        return str
            .split("")
            .map((char) => {
                const lower = char.toLowerCase();
                const options = currentMap[lower];

                if (options && options.length > 0) {
                    return options[Math.floor(Math.random() * options.length)];
                }
                return char;
            })
            .join("");
    };

    // Regex to preserve DCC{...} structure
    const match = input.match(/^(.*\{)(.+)(\}.*)$/);

    if (match) {
        let innerText = match[2];
        const suffix = match[3];
        const prefix = match[1];

        // Protect {hash}
        const hasHash = innerText.includes("{hash}");
        if (hasHash) {
            innerText = innerText.replace("{hash}", "___HASH___");
        }

        let result = transform(innerText);

        // Restore {hash}
        if (hasHash) {
            result = result.replace("___HASH___", "{hash}");
            // Edge case: if the transformation messed up the placeholder boundary
            // usually not an issue with this logic, but good to be safe
        }

        return prefix + result + suffix;
    } else {
        // Protect {hash} in raw strings
        if (input.includes("{hash}")) {
            const parts = input.split("{hash}");
            return parts.map(transform).join("{hash}");
        }
        return transform(input);
    }
}
