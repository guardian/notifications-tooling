import { Router } from 'express';

const router = new Router();

// Example notification route
router.get('/', (_req, res) => {
  res.json([{ id: 1, message: 'You have a new notification!' }]);
});

export default router;
