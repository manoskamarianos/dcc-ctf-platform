import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // 1. Initialize the response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Create the Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // 3. Get the user (securely validates the token)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 4. Define Route Groups
    const protectedPaths = [
        "/home",
        "/challenges",
        "/profile",
        "/teams",
        "/leaderboard",
        "/settings",
    ];

    const authPaths = ["/login", "/register"];

    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    // 5. Handle Redirections

    // CASE A: User is NOT logged in, trying to access a protected page
    if (!user && isProtectedPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // CASE B: User IS logged in, trying to access login/register pages
    if (user && isAuthPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    // CASE C: User is landing on root "/" -> redirect based on auth status
    if (request.nextUrl.pathname === "/") {
        const url = request.nextUrl.clone();
        if (user) {
            url.pathname = "/home";
        } else {
            url.pathname = "/login";
        }
        return NextResponse.redirect(url);
    }

    return response;
}
