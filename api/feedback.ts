import {
  CreateFeedbackBody,
  CreateFeedbackResponse,
} from "../lib/api-zod/src/generated/api";

declare const process: {
  env: Record<string, string | undefined>;
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
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Please check your details and try submitting again.",
    });
    return;
  }

  const webAppUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL?.trim();
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

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
        feedback: parsed.data,
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
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
  }

  if (
    !sheetResponse.ok ||
    !sheetResult ||
    sheetResult.ok !== true ||
    typeof sheetResult.id !== "number" ||
    typeof sheetResult.submittedAt !== "string"
  ) {
    res.status(502).json({
      error: "We couldn't save your feedback just now. Please try again.",
    });
    return;
  }

  const response = CreateFeedbackResponse.safeParse({
    id: sheetResult.id,
    submittedAt: sheetResult.submittedAt,
    message: "Thank you for sharing your feedback with us.",
  });

  if (!response.success) {
    res.status(502).json({
      error: "We couldn't save your feedback just now. Please try again.",
    });
    return;
  }

  res.status(201).json(response.data);
}
