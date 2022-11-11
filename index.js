import express, { json } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import URL from './models/urlModel.js';
import QRCode from 'qrcode';
import middlewareConfig from './middleware/config.js';
import { authRapid } from './services/auth.services.js';
import sendEmail from './services/email.services.js';

// .env variables
dotenv.config();
const port = process.env.PORT;
const debugPort = process.env.HOSTNAME == 'http://localhost' ? `:${port}` : '';
const HOSTNAME = process.env.HOSTNAME;
const environment = process.env.NODE_ENV || 'development';
var isDevelopment = environment === 'development';

// path resolver
const __dirname = path.resolve();

// express setup
const app = express();
// middleware
if (isDevelopment) {
  console.info('----------------------------------');
  console.info('----- Development Envoirment -----');
  console.info('----------------------------------');
} else {
  middlewareConfig(app);
}

// MongoDB
mongoose.connect(process.env.MONGO_DB_URI, (err) => {
  if (err) {
    console.log(err);
  }
  console.info('------- Database connected -------');
  console.info('----------------------------------');
});

/**
 * Removes the url after a set amount of seconds
 * @param {String} id
 *
 */
const destroyOnTimeout = async (id) => {
  const entry = await URL.findOne({ id });
  if (!entry) {
    return;
  }
  console.info(`entry[${id}] has timed out...`);
  entry.delete();
  console.info(`entry[${id}] deleted`);
};
/**
 * Stores shortened URL & redirect URL in MongoDB
 * @param {Express.req} req
 * @param {String} url
 * @returns Shortened URL
 */
const genDynamicUrl = async (req, url) => {
  const to = req.query?.timeout || req.body?.timeout;
  const timeOut =
    parseInt(to) < 0 || parseInt(to) > 600 ? 180000 : parseInt(to) * 1000;

  let id = nanoid(7);
  const newURL = new URL({ url, id });
  try {
    newURL.save();
    setTimeout(() => destroyOnTimeout(id), timeOut || 180000);
  } catch (err) {
    res.send('An error was encountered! Please try again.');
  }
  const dynamicURL = `${HOSTNAME}${debugPort}/link/${newURL.id}`;

  return dynamicURL;
};

/**
 * @param {Express.req} req
 * @param {Express.res} res
 * @param {String} text
 * @param {Boolean} dynamic
 * @param {JSON} opts
 * @returns QR Code as image
 */
const generateQR = async (req, res, text, dynamic, opts) => {
  try {
    const contents = {};
    contents.url = text;
    if (dynamic) {
      contents.url = await genDynamicUrl(req, text);
    }
    const data = await QRCode.toDataURL(contents.url, opts);
    const qrData = data.split(',');
    const img = Buffer.from(qrData[1], 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', img.length);
    return img;
  } catch (err) {
    console.error(err);
  }
};

app.use(express.json());

/**
 * @param {JSON} options
 * @returns options || default options
 */
const getOpts = (options) => {
  const opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: options.quality || 1.0,
    margin: options.margin || 1,
    color: {
      dark: options.dark || '#000000',
      light: options.light || 'fefefe',
    },
    width: options.width || 500,
  };
  return opts;
};

/**
 * /qr API endpoint to generate QR code
 * Supports both req.body and req.query
 */
app.get('/qr', authRapid, async (req, res) => {
  let opts = {};
  const { data } = req.query.data ? req.query : req.body;
  const { options } = req.body.data
    ? req.body
    : {
        options: {
          width: req.query?.width,
          dark: req.query?.dark,
          light: req.query?.light,
          quality: req.query?.quality,
          margin: req.query?.margin,
        },
      };
  if (options) {
    options.width = options?.width || null;
    options.dark = options?.dark || null;
    options.light = options?.light || null;
    options.quality = options?.quality || null;
    options.margin = options?.margin || null;
    opts = getOpts(options);
  }
  if (!data) {
    if (req.body) {
      if (!req.body.data) {
        return res.status(400).send('no data provided');
      }
    }
    return res.status(400).send('no data provided');
  }
  const img = await generateQR(req, res, data, true, opts);
  res.send(img);
});

/**
 * Endpoint is used to redirect the shortened URL to the acutual URL
 * the URL gets consumed and will not redirect a second time
 */
app.get('/link/:id', async (req, res) => {
  const id = req.params.id;

  const originalLink = await URL.findOne({ id });

  if (!originalLink) {
    return res.sendFile(__dirname + '/public/index.html');
  }
  res.redirect(originalLink.url);
  originalLink.delete();
});

/**
 * Access Denied Endpoint - Redirect Here if Auth fails
 */

app.get('/access-denied', (req, res) => {
  res.status(401);
  const accepts = req.header('accept') || ['json'];
  if (accepts.includes(',')) {
    return (
      res.sendFile(__dirname + '/public/get-access.html') &&
      !!accepts.split(',').find((e) => e == 'text/html')
    );
  }

  res.json({
    message: 'Acces Denied',
    getAccess: 'https://rapidapi.com/Pingu1337/api/qrx1',
  });
});

/**
 * Testing Authorization
 */
app.get('/testAuth', authRapid, (req, res) => {
  res.send('Authorized!');
});

/**
 * Just some idéa i had about publishing Advertisment on the "this url is consumed page"
 */

app.use(express.urlencoded({ extended: true }));
app.get('/advertise', (req, res) => {
  return res.sendFile(__dirname + '/public/advertise.html');
});
app.post('/advertise', async (req, res) => {
  await sendEmail(req.body);
  res.sendFile(__dirname + '/public/advertise-submitted.html');
});

app.listen(port, () => {
  console.info(`-- QRx1 listening on port: ${port} --`);
  console.info('----------------------------------');
});
