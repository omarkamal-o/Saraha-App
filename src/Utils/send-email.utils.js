import nodemailer from 'nodemailer';
import eventEmitter from 'node:events';


export const sendEmail = async (
    {
        to ,
        cc = 'omarkamal934@gmail.com',
        subject ,
        content ,
        attachments = []
    }
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user : process.env.USER_EMAIL ,
            pass : process.env.USER_PASSWORD
        },
    });
    const info = await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to,
        cc,
        subject,
        html: content,
        attachments
    })
    // console.log(`info: ${info}`);
    
    return info;
}

export const emitter = new eventEmitter();

emitter.on('sendEmail' , (args) => {
sendEmail(args);
});