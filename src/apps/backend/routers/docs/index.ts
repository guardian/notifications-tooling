import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { authRedirectMiddleware } from '../../middleware/auth-middleware';
import { openApiDocument } from './openapi';

export const docsRouter = Router();
docsRouter.use(authRedirectMiddleware);

docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(openApiDocument));
