//  why do we need a Account Question 
//  As in modern website we can signin with the socila platforms like google,gthub etc but if a user wants to sign in in the traditional way of email and password

import { model, models, Schema, Types } from "mongoose";

export interface IModel {}

const ModelSchema  = new Schema<IModel>({},{
    timestamps : true
});

const Model = models?.Account || model<IModel>("Account",ModelSchema)

export default Model;