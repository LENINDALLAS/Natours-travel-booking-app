const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const sgMail = require('@sendgrid/mail')

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, NODE_ENV, SENDGRID_KEY } = process.env;

sgMail.setApiKey(SENDGRID_KEY);

module.exports = class {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Lenin Dallas L <${EMAIL_FROM}>`
    }

    newTransport() {        
        // if (NODE_ENV.trim() === 'production') {
        //     console.log('sendgrid', SENDGRID_NAME.length, SENDGRID_KEY.length)
        //     return nodemailer.createTransport({
        //         service: 'SendGrid',
        //         auth: {
        //             user: SENDGRID_NAME,
        //             pass: SENDGRID_KEY
        //         }
        //     })
        // }

        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD
            }
        })

    }

   async send(template, subject) {
        //prepare html template
    //    console.log(`${__dirname}/../views/email/${template}.pug`);
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // options for mail
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            text: convert(html),
            html
        };
       if (NODE_ENV.trim() === 'production') {
          await sgMail.send(mailOptions)
       } else {
        await this.newTransport().sendMail(mailOptions);
       }
    }

    async sendWelcome() {
       await this.send('welcome', 'Welcome to Natours Family...');
    }

    async sendResetPassword() {
        await this.send('passwordReset', 'Request to reset account password')
    }
}

// const sendEmail = async options => {
//     //     console.log({
//     //         SMTP_USER, SMTP_HOST, SMTP_PORT, SMTP_PASSWORD
//     // });
//     const transporter = nodemailer.createTransport({
//         host: SMTP_HOST,
//         port: SMTP_PORT,
//         auth: {
//             user: SMTP_USER,
//             pass: SMTP_PASSWORD
//         }
//     });

//     const mailOptions = {
//         from: "Lenin Dallas L <lenindallas.ld@gmail.com>",
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         //html 
//     };

//     await transporter.sendMail(mailOptions);
// };
