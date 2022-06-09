const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env ;

const sendEmail = async options => {
//     console.log({
//         SMTP_USER, SMTP_HOST, SMTP_PORT, SMTP_PASSWORD
// });
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: "Lenin Dallas L <lenindallas.ld@gmail.com>",
        to: options.email,
        subject: options.subject,
        text:options.message,
        //html 
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;