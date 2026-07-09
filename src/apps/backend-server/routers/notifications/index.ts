import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
	res.json([{ id: 1, message: "You have a new notification!" }]);
});

export default router;
