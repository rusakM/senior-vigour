import mongoose from 'mongoose';
import { ConstantsEnv } from './constants';

export default async function (): Promise<void> {
    const DB: string = ConstantsEnv.Mongodb.DB_URL.replace('<username>', ConstantsEnv.Mongodb.DB_USERNAME).replace('<password>', ConstantsEnv.Mongodb.DB_PASSWORD).replace('<host>', ConstantsEnv.Mongodb.DB_HOST).replace('<database>', ConstantsEnv.Mongodb.DB_NAME);

    mongoose.connect(DB);

    const dbConnection: mongoose.Connection = mongoose.connection;
    dbConnection.once('open', () => console.log('connection with db OK!'));
    dbConnection.on('error', (err) => console.error(err));
}
