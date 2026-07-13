import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { bodySchema } from './schemas/notification-push-request';

export const notificationsRouter = Router();

notificationsRouter.get('/', (_req: Request, res: Response) => {
	res.json([{ id: 1, message: 'You have a new notification!' }]);
});

notificationsRouter.post('/', validate({ body: bodySchema }), (req, res) => {
	res.status(201).json({ id: Date.now(), ...req.body });
});
