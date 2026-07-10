import { type Request, type Response, Router } from "express";
import { notificationPushRequestSchema } from "../../schemas/notification-push";
import { validate } from "../../utils/middleware/validator";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json([{ id: 1, message: "You have a new notification!" }]);
});

router.post(
  "/",
  validate(notificationPushRequestSchema),
  (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    res.status(201).json({ id: Date.now(), message });
  },
);

export default router;
