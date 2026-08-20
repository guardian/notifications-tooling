import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import getAbsoluteSwaggerFsPath from 'swagger-ui-dist/absolute-path';
import { authRedirectMiddleware } from '../../middleware/auth-middleware';
import fs from 'node:fs';
import path from 'node:path';
import { openApiDocument } from './openapi';

const swaggerPath = getAbsoluteSwaggerFsPath();

console.log('Swagger path:', swaggerPath);
console.log(
    'Bundle exists:',
    fs.existsSync(path.join(swaggerPath, 'swagger-ui-bundle.js')),
);


export const docsRouter = Router();
docsRouter.use(authRedirectMiddleware);

docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(openApiDocument));
