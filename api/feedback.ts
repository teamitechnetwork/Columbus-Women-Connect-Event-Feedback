/// <reference lib="dom" />

declare const process: {
  env: Record<string, string | undefined>;
};

type FeedbackPayload = {
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  overallRating: number;
  mostValuable?: string | null;
  improvements?: string | null;
  futureTopics?: string | null;
  contactRequested: boolean;
  futureUpdates: boolean;
};

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
};

type SheetResponse = {
  ok?: unknown;
  id?: unknown;
  submittedAt?: unknown;
  errorCode?: unknown;
};

function isOptionalText(value: unknown, maxLength: number): boolean {
  return (
    value == null ||
    (typeof value === "string" && value.length <= maxLength)
  );
}

function isFeedbackPayload(value: unknown): value is FeedbackPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const feedback = value as Record<string, unknown>;
  const email = typeof feedback.email === "string" ? feedback.email.trim() : "";

  return (
    typeof feedback.fullName === "string" &&
    feedback.fullName.trim().length > 0 &&
    feedback.fullName.length <= 120 &&
    email.length > 0 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    isOptionalText(feedback.phone, 40) &&
    isOptionalText(feedback.organization, 120) &&
    Number.isInteger(feedback.overallRating) &&
    (feedback.overallRating as number) >= 1 &&
    (feedback.overallRating as number) <= 5 &&
    isOptionalText(feedback.mostValuable, 2000) &&
    isOptionalText(feedback.improvements, 2000) &&
    isOptionalText(feedback.futureTopics, 2000) &&
    typeof feedback.contactRequested === "boolean" &&
    typeof feedback.futureUpdates === "boolean"
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const feedback = req.body;
  if (!isFeedbackPayload(feedback)) {
    res.status(400).json({
      error: "Please check your details and try submitting again.",
    });
    return;
  }

  // Accept the existing Vercel names as well as the documented names.
  const webAppUrl =
    process.env.GOOGLE_SHEETS_WEB_APP_URL?.trim() ||
    process.env.GOOGLE_SCRIPT_URL?.trim();
  const webhookSecret =
    process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || process.env.GOOGLE_SCRIPT_SECRET;

  if (!webAppUrl || !webhookSecret) {
    res.status(503).json({
      error: "Feedback delivery is not configured.",
    });
    return;
  }

  let endpoint: URL;
  try {
    endpoint = new URL(webAppUrl);
  } catch {
    res.status(503).json({
      error: "Feedback delivery is not configured.",
    });
    return;
  }

  if (endpoint.protocol !== "https:") {
    res.status(503).json({
      error: "Feedback delivery is not configured.",
    });
    return;
  }

  let sheetResponse: Response;
  try {
    sheetResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        feedback,
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    console.error("Feedback Apps Script request failed.", {
      code: "apps_script_unreachable",
    });
    res.status(502).json({
      error: "We couldn't save your feedback just now. Please try again.",
    });
    return;
  }

  let sheetResult: SheetResponse | null = null;
  try {
    sheetResult = (await sheetResponse.json()) as SheetResponse;
  } catch {
    // Treat a non-JSON or malformed Apps Script response as a failed delivery.
    console.error("Feedback Apps Script response was not JSON.", {
      status: sheetResponse.status,
    });
  }

  const submittedAt =
    typeof sheetResult?.submittedAt === "string"
      ? new Date(sheetResult.submittedAt)
      : null;

  if (
    !sheetResponse.ok ||
    !sheetResult ||
    sheetResult.ok !== true ||
    typeof sheetResult.id !== "number" ||
    !Number.isInteger(sheetResult.id) ||
    sheetResult.id < 1 ||
    !submittedAt ||
    !Number.isFinite(submittedAt.getTime())
  ) {
    console.error("Feedback Apps Script delivery was rejected.", {
      status: sheetResponse.status,
      code:
        typeof sheetResult?.errorCode === "string" &&
        [
          "missing_script_properties",
          "secret_mismatch",
          "invalid_feedback",
          "sheet_write_failed",
        ].includes(sheetResult.errorCode)
          ? sheetResult.errorCode
          : "invalid_response",
    });
    res.status(502).json({
      error: "We couldn't save your feedback just now. Please try again.",
    });
    return;
  }

  res.status(201).json({
    id: sheetResult.id,
    submittedAt: submittedAt.toISOString(),
    message: "Thank you for sharing your feedback with us.",
  });
}
