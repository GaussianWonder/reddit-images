import config from '../env/config';
import Snoowrap from 'snoowrap';
import { args } from '../env/argparse';

export const acquireRequester = () => {
  const instance = new Snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    accessToken: config.oauth.accessToken,
    refreshToken: config.oauth.refresh_token,
  });

  const instanceConfig = instance.config({
    debug: args.debug,
    // requestDelay: 1020,
    requestDelay: 2000,
  });

  if (args.debug) console.log('Requester config: ', instanceConfig);

  return instance;
};
