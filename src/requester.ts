import config from './config';
import snoowrap from 'snoowrap';

export const acquireRequester = () =>
  new snoowrap({
    userAgent: config.userAgent.toString(),
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    accessToken: config.oauth.accessToken,
  });
