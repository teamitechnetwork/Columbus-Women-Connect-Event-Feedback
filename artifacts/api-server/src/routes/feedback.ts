import { Router, type IRouter } from "express";
import {
  CreateFeedbackBody,
  CreateFeedbackResponse,
} from "@workspace/api-zod";
import { db, feedbackTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/feedback", async (req, res) => {
  const parsed = CreateFeedbackBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Please check your details and try submitting again.",
    });
    return;
  }

  try {
    const [saved] = await db
      .insert(feedbackTable)
      .values({
        fullName: parsed.data.fullName.trim(),
        email: parsed.data.email.trim().toLowerCase(),
        phone: parsed.data.phone?.trim() || null,
        organization: parsed.data.organization?.trim() || null,
        overallRating: parsed.data.overallRating,
        mostValuable: parsed.data.mostValuable?.trim() || null,
        improvements: parsed.data.improvements?.trim() || null,
        futureTopics: parsed.data.futureTopics?.trim() || null,
        contactRequested: parsed.data.contactRequested,
        futureUpdates: parsed.data.futureUpdates,
      })
      .returning({
        id: feedbackTable.id,
        submittedAt: feedbackTable.submittedAt,
      });

    if (!saved) {
      throw new Error("Feedback insert returned no record");
    }

    const response = CreateFeedbackResponse.parse({
      id: saved.id,
      submittedAt: saved.submittedAt,
      message: "Thank you for sharing your feedback with us.",
    });
    res.status(201).json(response);
  } catch (error) {
    req.log.error(
      { errorType: error instanceof Error ? error.name : "UnknownError" },
      "Unable to save event feedback",
    );
    res.status(500).json({
      error: "We couldn't save your feedback just now. Please try again.",
    });
  }
});

export default router;
