import passport from 'passport';
import RapidAPIPassportStrategy from 'passport-rapid-api-auth';
import dotenv from 'dotenv';
dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const isDevelopment = environment === 'development';

const Auth = isDevelopment
  ? developmentAuth
  : passport.authenticate('rapid-api', {
      session: false,
      failureRedirect: '/access-denied',
      failureMessage: true,
    });

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

passport.use('rapid-api', new RapidAPIPassportStrategy(authParams, verify));

function developmentAuth(req, res, next) {
  console.info('--------- DevelopmentEnv ---------');
  console.info('--------- Skipping Auth! ---------');
  console.info('----------------------------------');
  console.info('------------ headers: ------------');
  console.info(req.headers);
  console.info('------------ reqBody: ------------');
  console.info(req.body);
  next();
}

export const authRapid = Auth;
