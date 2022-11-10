import passport from 'passport';
import RapidAPIPassportStrategy from 'passport-rapid-api-auth';
import dotenv from 'dotenv';

dotenv.config();

const authParams = {
  passReqToCallback: false,
  proxySecret: process.env.RAPID_API_PROXY_SECRET || null,
};

function verify(...args) {
  const [user, id, next] = args;

  return next(null, {
    id,
    name: user.name,
    subscription: user.subscription,
    version: user.version,
  });
}

export default (app) => {
  passport.use('rapid-api', new RapidAPIPassportStrategy(authParams, verify));
  app.use(passport.initialize());
};
