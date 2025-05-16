import { NextRequest, NextResponse } from 'next/server';
import { analyzeSeo } from '@/lib/seo-analyzer';

// Cache results for 30 minutes to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type = "url" } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    // Validate URL format for URL type
    if (type === "url") {
      try {
        new URL(url);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }
    
    // Check cache first
    const cacheKey = `${type}:${url}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      return NextResponse.json(cachedResult.data);
    }
    
    // Perform real SEO analysis
    const results = await analyzeSeo(url, type);
    
    // Cache the results
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    return NextResponse.json(
      { error: "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // For direct API access, allow GET requests with URL in query params
    const url = request.nextUrl.searchParams.get("url");
    const type = request.nextUrl.searchParams.get("type") || "url";
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    // Validate URL for URL type
    if (type === "url") {
      try {
        new URL(url);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }
    
    // Check cache first
    const cacheKey = `${type}:${url}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      return NextResponse.json(cachedResult.data);
    }
    
    // Perform real SEO analysis
    const results = await analyzeSeo(url, type);
    
    // Cache the results
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in SEO analysis GET request:", error);
    return NextResponse.json(
      { error: "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}
