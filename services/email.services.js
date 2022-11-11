import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const environment = process.env.NODE_ENV || 'development';
const isDevelopment = environment === 'development';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_SECRET,
  },
});

const sendAutoResponse = async (email) => {
  const mailOptions = {
    from: `"QRx1" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Advertisment on QRx1`,
    text: `We will contact you shortly.`,
    html: `
        <body style="text-align:center;">
            <h1>Thank you for contacting us, we will get back to you as soon as possible.</h1>
            <p>This is an automated email, replies to this address will not reach us. <br> Contact us on <a href='mailto:contact@berrykitten.com'>contact@berrykitten.com</a></p>
        </body>
        `,
  };
  const info = await transporter.sendMail(mailOptions);
  console.info('[mailBot]: Message sent: %s', info.messageId);
};

const sendCopy = async (body) => {
  const mailOptions = {
    from: `"QRx1 [Admin]" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_COPY,
    subject: `New message received | Advertisment on QRx1`,
    text: `We will contact you shortly.`,
    html: `
            <body style="text-align:center;">
                <h2>New message received from <b>${body.org}</b></h2>
                <div style="text-align:left; margin:auto; width: fit-content;">
                    <p>Email: ${body.email} <br>Org: <b>${body.org}</b></p>
                    <hr/>
                    <p>${body.msg}</p>
                </div>
            </body>
            `,
  };
  const info = await transporter.sendMail(mailOptions);
  console.info('[mailBot]: Message sent: %s', info.messageId);
};

const sendEmail = async (body) => {
  if (isDevelopment) {
    console.info('Mail service is disabled in development mode');
    return;
  }
  const { org, email, msg } = body;
  await sendAutoResponse(email);
  await sendCopy(body);
};

export default sendEmail;
