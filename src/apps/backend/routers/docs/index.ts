import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { authRedirectMiddleware } from '../../middleware/auth-middleware';
import { openApiDocument } from './openapi';

const docsBasePath = '/docs/api/';
const swaggerHtml = swaggerUi
	.generateHTML(openApiDocument)
	.replaceAll('./swagger-ui.css', `${docsBasePath}swagger-ui.css`)
	.replaceAll('./favicon-32x32.png', `${docsBasePath}favicon-32x32.png`)
	.replaceAll('./favicon-16x16.png', `${docsBasePath}favicon-16x16.png`)
	.replaceAll('./swagger-ui-bundle.js', `${docsBasePath}swagger-ui-bundle.js`)
	.replaceAll(
		'./swagger-ui-standalone-preset.js',
		`${docsBasePath}swagger-ui-standalone-preset.js`,
	)
	.replaceAll('./swagger-ui-init.js', `${docsBasePath}swagger-ui-init.js`);

export const docsRouter = Router();
docsRouter.use(authRedirectMiddleware);

docsRouter.get(['', '/'], (_request, response) => {
	response.type('html').send(swaggerHtml);
});

docsRouter.use('/', swaggerUi.serve);
