//  why do we need a Account Question 
//  As in modern website we can signin with the socila platforms like google,gthub etc but if a user wants to sign in in the traditional way of email and password

import { model, models, Schema, } from "mongoose";

export interface ITag {
    name: string;
    questions: number;
}

const TagSchema  = new Schema<ITag>({
name: {type: String, required: true, unique: true},
questions: {type: Number, default: 0},
},{ timestamps : true});

const Tag = models?.Tag|| model<ITag>("Tag",TagSchema);

export default Tag;