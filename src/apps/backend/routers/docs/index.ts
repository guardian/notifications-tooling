import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { authRedirectMiddleware } from '../../middleware/auth-middleware';
import { openApiDocument } from './openapi';

const docsBasePath = '/docs/api/';
const swaggerHtml = swaggerUi
	.generateHTML(openApiDocument)
	.replaceAll(/\.\/(?=[\w-]+\.(?:css|js|png))/g, docsBasePath);

export const docsRouter = Router();
docsRouter.use(authRedirectMiddleware);

docsRouter.get(['', '/'], (_request, response) => {
	response.type('html').send(swaggerHtml);
});

docsRouter.use('/', swaggerUi.serve);
