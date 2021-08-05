import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import User from '../entities/User';
import { Options } from 'nodemailer/lib/smtp-transport';

const _SITE_URL: string = (process.env.PRODUCT_URL || '').replace(/\/$/ig, '');

const SMTPConfig: Options = {
    service: '',
    host: String(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: String(process.env.SMTP_USER_EMAIL),
        pass: String(process.env.SMTP_USER_PASSWORD),
    },
};
const emailTransporter = nodemailer.createTransport(SMTPConfig);

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: process.env.PRODUCT_NAME || '',
        link: process.env.PRODUCT_URL || '',
    },
});

const sendConfirmationEmail = async (user: User) => {
    const email = {
        body: {
            title: 'Hello!',
            action: {
                instructions: 'Simply click the link below to confirm your email and secure your spot on the waitlist.',
                button: {
                    color: '#22BC66',
                    text: 'Confirm Your Email',
                    link: `${_SITE_URL}/confirmEmail?email=${user.email}&hash=${user.hash}`,
                },
            },
            outro: `Need help, or have questions? Just reply to this email, we'd love to help.`,
        },
    };

    const emailBody = mailGenerator.generate(email);
    const emailText = mailGenerator.generatePlaintext(email);

    await emailTransporter.sendMail({
        from: `${process.env.SMTP_USER_DISPLAY} <${process.env.SMTP_USER_EMAIL}>`,
        to: user.email,
        subject: 'Confirm your email',
        html: emailBody,
        text: emailText,
    });
};

const sendWelcomeEmail = async (user: User) => {
    const email = {
        body: {
            title: 'You\'re on the list.',
            intro: [
                'Hang tight and we will let you in soon.',
                'Want access faster? Get others to sign up using your referral code and we will bump you up the list.',
                `Referral Link: ${process.env.REFERRAL_LINK_URL}/?r=${user.id}`,
            ],
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
        },
    };

    const emailBody = mailGenerator.generate(email);
    const emailText = mailGenerator.generatePlaintext(email);

    await emailTransporter.sendMail({
        from: `${process.env.SMTP_USER_DISPLAY} <${process.env.SMTP_USER_EMAIL}>`,
        to: user.email,
        subject: 'you\'re on the list',
        html: emailBody,
        text: emailText,
    });
};

export default emailTransporter;
export {
    sendConfirmationEmail,
    sendWelcomeEmail,
};