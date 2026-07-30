import serverlessExpress from '@codegenie/serverless-express';
import { UserPermissions } from '@config';
import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { loginMiddleware } from './middleware/auth-middleware';
import { staticAssetsMiddleware } from './middleware/static-assets-middleware';
import { channelsRouter } from './routers/channels';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationsRouter } from './routers/notifications';
import { userRouter } from './routers/user';
import { checkPermissions } from './utils/permissions/check-permissions';

export const app: Application = express();

app.disable('x-powered-by');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	loginMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		const noAccessMessage =
			'You do not have permission to use Dispatch. If you believe this is a mistake please contact Central Production.';

		const hasAccess = await checkPermissions(req.user!.email, [
			UserPermissions.DispatchAccess,
		]);

		if (!hasAccess) {
			return res.status(403).send(noAccessMessage);
		}

		return next();
	},
	staticAssetsMiddleware,
);

app.use('/health', healthRouter);

// Private - authenticated routes
app.use('/v1/channels', channelsRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/user', userRouter);
app.use('/docs/api', docsRouter);

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	req.log.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

export const handler = serverlessExpress({ app });
