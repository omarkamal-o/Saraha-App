import crypto from 'node:crypto';
import fs from 'node:fs';


const IV_LENGTH = +process.env.IV_LENGTH;
const ENCRYPTION_SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY);

export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY ,iv);
    let encrypted = cipher.update(text , 'utf8' , 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')} : ${encrypted}`;
}

export const decrypt = (encryptedData) => {
    const [iv , encryptedText] = encryptedData.split(':');
    const binaryLikeIv = Buffer.from(iv , 'hex');
    const decipher = crypto.createDecipheriv( 'aes-256-cbc' , ENCRYPTION_SECRET_KEY , binaryLikeIv);
    let decryptedData = decipher.update(encryptedText , 'hex' , 'utf8');
    const finalDecryptedData = decryptedData + decipher.final('utf8');
    return finalDecryptedData;
}

if (fs.existsSync('public.pem') && fs.existsSync('private.pem')){
    console.log('public.pem and private.pem already exists');    
} else {
    const {publicKey , privateKey} = crypto.generateKeyPairSync('rsa' , {
        modulusLength: 2084,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        }
    })
    fs.writeFileSync('public.pem' , publicKey);
    fs.writeFileSync('private.pem' , privateKey);
    console.log('public.pem and private.pem created successfully');
}


export const asymmetricEncryption = (text) => {
    const publicKey = fs.readFileSync('public.pem' , 'utf8');
    const BufferText = Buffer.from(text);
    const data = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    } , BufferText);
    return data.toString('hex');
}

export const asymmetricDecryption = (encryptedData) => {
    const privateKey = fs.readFileSync('private.pem' , 'utf8');
    const BufferText = Buffer.from(encryptedData , 'hex');
    const data = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    } , BufferText);
    return data.toString('utf8');
}