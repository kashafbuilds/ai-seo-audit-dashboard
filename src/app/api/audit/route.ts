import { google } from "@ai-sdk/google";
import { generateText } from "ai";

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clampScore(value: unknown): number {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return Response.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    let websiteUrl = url.trim();

    if (!websiteUrl) {
      return Response.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    if (
      !websiteUrl.startsWith("http://") &&
      !websiteUrl.startsWith("https://")
    ) {
      websiteUrl = `https://${websiteUrl}`;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(websiteUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return Response.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    websiteUrl = parsedUrl.toString();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;

    try {
      response = await fetch(websiteUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 SEO-Audit-Bot",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return Response.json(
          {
            error:
              "The website took too long to respond. Please try another URL.",
          },
          { status: 408 }
        );
      }

      return Response.json(
        {
          error:
            "Could not connect to the website. Please check the URL and try again.",
        },
        { status: 400 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return Response.json(
        {
          error: `Could not access website. Status: ${response.status}`,
        },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return Response.json(
        {
          error: "The provided URL does not appear to be an HTML webpage.",
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    if (!html.trim()) {
      return Response.json(
        {
          error: "The website returned an empty page.",
        },
        { status: 400 }
      );
    }

    const titleMatch = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    const descriptionMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );

    const reverseDescriptionMatch = html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i
    );

    const h1Match = html.match(
      /<h1[^>]*>([\s\S]*?)<\/h1>/i
    );

    const title = cleanText(titleMatch?.[1] || "") || "Missing";

    const description =
      cleanText(
        descriptionMatch?.[1] ||
          reverseDescriptionMatch?.[1] ||
          ""
      ) || "Missing";

    const h1 = cleanText(h1Match?.[1] || "") || "Missing";

    const prompt = `
You are an SEO analysis assistant.

Analyze the following website metadata.

URL: ${websiteUrl}

Title: ${title}

Meta Description: ${description}

H1: ${h1}

Use these general SEO guidelines:

- A good title is usually around 50–60 characters.
- A good meta description is usually around 150–160 characters.
- A page should normally have a clear H1.
- Scores must reflect the available metadata only.
- Do not invent information that is not provided.
- Performance score should be conservative because actual Lighthouse performance data is not available.

Return ONLY valid JSON with exactly these fields:

{
  "overallScore": number,
  "technicalScore": number,
  "onPageScore": number,
  "performanceScore": number,
  "titleStatus": "Pass" or "Needs Improvement",
  "descriptionStatus": "Pass" or "Missing",
  "h1Status": "Pass" or "Missing",
  "summary": string,
  "recommendations": string[]
}

Rules:

- All scores must be integers between 0 and 100.
- titleStatus should be "Pass" only when the title is present and reasonably optimized.
- descriptionStatus should be "Pass" only when a meta description is present and reasonably useful.
- h1Status should be "Pass" only when an H1 is present.
- Give 3 to 5 practical recommendations.
- Keep the summary concise and specific to the provided metadata.
- Do not use markdown.
- Do not include code fences.
`;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        {
          error:
            "Gemini API key is not configured. Please check your .env.local file.",
        },
        { status: 500 }
      );
    }

    const result = await generateText({
      model: google("gemini-3.6-flash"),
      prompt,
    });

    let audit;

    try {
      audit = JSON.parse(result.text.trim());
    } catch {
      console.error("Invalid AI response:", result.text);

      return Response.json(
        {
          error: "AI returned an invalid response. Please try again.",
        },
        { status: 500 }
      );
    }

    if (!audit || typeof audit !== "object") {
      return Response.json(
        {
          error: "AI returned an invalid audit.",
        },
        { status: 500 }
      );
    }

    audit = {
      overallScore: clampScore(audit.overallScore),
      technicalScore: clampScore(audit.technicalScore),
      onPageScore: clampScore(audit.onPageScore),
      performanceScore: clampScore(audit.performanceScore),

      titleStatus:
        audit.titleStatus === "Pass"
          ? "Pass"
          : "Needs Improvement",

      descriptionStatus:
        audit.descriptionStatus === "Pass"
          ? "Pass"
          : "Missing",

      h1Status:
        audit.h1Status === "Pass"
          ? "Pass"
          : "Missing",

      summary:
        typeof audit.summary === "string"
          ? audit.summary
          : "No summary was generated.",

      recommendations: Array.isArray(audit.recommendations)
        ? audit.recommendations
            .filter(
              (item: unknown): item is string =>
                typeof item === "string"
            )
            .slice(0, 5)
        : [],
    };

    return Response.json({
      url: websiteUrl,
      metadata: {
        title,
        description,
        h1,
      },
      audit,
    });
  } catch (error) {
    console.error("SEO audit error:", error);

    return Response.json(
      {
        error:
          "SEO audit failed. Please check the URL and try again.",
      },
      { status: 500 }
    );
  }
}