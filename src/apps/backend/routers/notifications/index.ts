import { type Request, type Response, Router } from "express";
import validate from "express-zod-safe";
import {
  bodySchema,
  type NotificationPushRequest,
} from "../../schemas/notification-push-request";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json([{ id: 1, message: "You have a new notification!" }]);
});

router.post(
  "/",
  validate({ body: bodySchema }),
  (req: NotificationPushRequest, res: Response) => {
    res.status(201).json({ id: Date.now(), ...req.body });
  },
);

export default router;
