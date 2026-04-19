//  why do we need a Account Model 
//  As in modern website we can signin with the socila platforms like google,gthub etc but if a user wants to sign in in the traditional way of email and password

import { model, models, Schema, Types } from "mongoose";

export interface IAccount {
    userId: Types.ObjectId;
    name: string;
    image?: string;
    password?: string;
    provider: string;
    providerAccountId: string;
}

export interface IAccountDoc extends IAccount, Document {}

const AccountSchema = new Schema<IAccount>({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    name: {type: String, required: true},
    image: {type: String, required: true},
    password: {type: String},
    provider: {type: String, required: true},
    providerAccountId :  {type: String, required: true},

},
{timestamps: true}
);

const Account = models?.Account || model<IAccount>("Account", AccountSchema);

export default Account;