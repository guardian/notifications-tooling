import serverlessExpress from '@codegenie/serverless-express';
import { app as placeholder } from './placeholder-app';

export const handler = serverlessExpress({ app: placeholder });
