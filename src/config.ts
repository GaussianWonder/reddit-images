import * as dotenv from 'dotenv'
import z from 'zod';
import oauth from '../oauth.json';

const envConfig = dotenv.config();
const envFile = envConfig.parsed;
if (envConfig.error)
  console.error('Error parsing .env file', envConfig.error, envFile);

const ConfigSchema = z.object({
  oauth: z.object({
    accessToken: z.string().min(1).default(envFile?.ACCESS_TOKEN ?? ''),
    tokenType: z.enum(["bearer"]).optional().default('bearer'),
    expiresIn: z.number().min(0).optional().default(0),
    scope: z.string().optional(),
  }),
  clientId: z.string().min(1),
  appSecret: z.string().min(1),
});

const config = ConfigSchema.parse({
  oauth: {
    accessToken: oauth.access_token,
    tokenType: oauth.token_type,
    expiresIn: oauth.expires_in,
    scope: oauth.scope,
  },
  clientId: envFile?.CLIENT_ID,
  appSecret: envFile?.APP_SECRET,
});

console.log('Parsed config:\n', config);

export default config;
