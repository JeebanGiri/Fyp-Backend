import { createTransport, SendMailOptions } from 'nodemailer';
import { Printer } from './printer';
import { SMTP_INFO } from 'src/@config/constants.config';

const transporter = createTransport({
  host: SMTP_INFO.host,
  port: SMTP_INFO.port,
  secure: true,
  auth: {
    user: SMTP_INFO.user,
    pass: SMTP_INFO.password,
  },
});

const sendMail = async (options: SendMailOptions) => {
  try {
    options.from = {
      name: 'Horizon Residence',
      address: SMTP_INFO.user,
    };
    const result = await transporter.sendMail(options);
    Printer('Send mail result', result);
  } catch (err) {
    Printer('Send mail error', err);
  }
};

export { sendMail };