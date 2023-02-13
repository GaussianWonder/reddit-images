import * as dotenv from 'dotenv';
import z from 'zod';
import oauth from '../../oauth.json';
import UserAgent from 'user-agents';

const envConfig = dotenv.config();
const envFile = envConfig.parsed;
if (envConfig.error)
  console.error('Error parsing .env file', envConfig.error, envFile);

const ConfigSchema = z.object({
  oauth: z.object({
    accessToken: z
      .string()
      .min(1)
      .default(envFile?.ACCESS_TOKEN ?? ''),
    tokenType: z.enum(['bearer']).optional().default('bearer'),
    expiresIn: z.number().min(0).optional().default(0),
    scope: z.string().optional(),
  }),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  database: z.object({
    name: z.string().min(1),
  }),
});

const config = ConfigSchema.parse({
  oauth: {
    accessToken: oauth.access_token,
    tokenType: oauth.token_type,
    expiresIn: oauth.expires_in,
    scope: oauth.scope,
  },
  clientId: envFile?.CLIENT_ID,
  clientSecret: envFile?.CLIENT_SECRET,
  database: {
    name: envFile?.DATABASE_NAME,
  },
});

const userAgent = new UserAgent();

export default {
  ...config,
  userAgent: userAgent.toString(),
  realUserAgent: 'crawler:GaussianGather:0.0.1 by u/GaussianWonder',
};