import config from './config';
import snoowrap from 'snoowrap';

const r = new snoowrap({
  userAgent: config.userAgent.toString(),
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  accessToken: config.oauth.accessToken,
});

export default r;
