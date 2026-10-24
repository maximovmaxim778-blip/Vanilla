import { NextRequest, NextResponse } from "next/server";

// the first host is the main one, the others are mirrors from the AniLibria developers
const Hosts = [
    "https://aniliberty.top/api/v1",
    "https://anilibria.top/api/v1",
    "https://api.anilibria.app/api/v1",
];
const IdPattern = /^[\w-]{1,120}$/;
const Timeout = 10_000;

function getPath(action: string, value: string): string | undefined {
    if (action === "search") {
        if (value.length === 0 || value.length > 120) {
            return;
        }

        return `/app/search/releases?query=${encodeURIComponent(value)}`;
    }

    if (!IdPattern.test(value)) {
        return;
    }

    if (action === "release") {
        return `/anime/releases/${value}`;
    }

    if (action === "episode") {
        return `/anime/releases/episodes/${value}`;
    }
}

export async function GET(request: NextRequest) {
    const action = request.nextUrl.searchParams.get("action") ?? "";
    const value = (request.nextUrl.searchParams.get("value") ?? "").trim();
    const path = getPath(action, value);

    if (path === undefined) {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    // links to episodes are signed, so they must not be cached for long
