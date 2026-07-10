import { type Request, type Response, Router } from "express";
import validate from "express-zod-safe";
import { notificationPushRequestBodySchema } from "../../schemas/notification-push-request";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json([{ id: 1, message: "You have a new notification!" }]);
});

router.post(
  "/",
  validate({ body: notificationPushRequestBodySchema }),
  (req: Request, res: Response) => {
    res.status(201).json({ id: Date.now(), ...req.body });
  },
);

export default router;
