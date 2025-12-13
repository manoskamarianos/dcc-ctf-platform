import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // 1. Create an initial response
    // We will attach cookies to this response object.
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
                    // Update the request cookies so `getUser` sees the new session immediately
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value),
                    );
                    
                    // Re-create the response object with the updated request
                    response = NextResponse.next({
                        request,
                    });
                    
                    // Set the cookies on the response object
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // 3. Get the user (this triggers 'setAll' if the token needs refreshing)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 4. Define Route Groups
    const protectedPaths = [
        "/home",
        "/challenges",
        "/machines",
        "/contests",
        "/profile",
        "/teams",
        "/leaderboard",
        "/settings",
        "/admin",
    ];

    const authPaths = ["/login", "/register"];

    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    // 5. Handle Redirections
    // We must ensure that any redirect response INHERITS the cookies set above.

    // CASE A: User is NOT logged in, trying to access a protected page
    if (!user && isProtectedPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        
        const redirectResponse = NextResponse.redirect(url);
        
        // COPY COOKIES from the Supabase-updated response to the redirect response
        const allCookies = response.cookies.getAll();
        allCookies.forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value, c);
        });
        
        return redirectResponse;
    }

    // CASE B: User IS logged in, trying to access login/register pages
    if (user && isAuthPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        
        const redirectResponse = NextResponse.redirect(url);
        
        // COPY COOKIES
        const allCookies = response.cookies.getAll();
        allCookies.forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value, c);
        });

        return redirectResponse;
    }

    // CASE C: User is landing on root "/" -> redirect based on auth status
    if (request.nextUrl.pathname === "/") {
        const url = request.nextUrl.clone();
        if (user) {
            url.pathname = "/home";
        } else {
            url.pathname = "/login";
        }
        
        const redirectResponse = NextResponse.redirect(url);
        
        // COPY COOKIES
        const allCookies = response.cookies.getAll();
        allCookies.forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value, c);
        });

        return redirectResponse;
    }

    // Default: Return the response (which might contain the refreshed cookie)
    return response;
}