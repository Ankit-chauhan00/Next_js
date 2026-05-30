
import { InteractionActionEnums } from "@/constants";
import { model, models, Schema, Types, Document } from "mongoose";

export interface Intraction {
    user: Types.ObjectId;
    action: string;
    actionId: Types.ObjectId,
    actionType: "question"| "answer";
}

export interface IIntarctionDoc extends Intraction, Document{}


const IntractionSchema  = new Schema<Intraction>({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    action: {
        type:String, 
        enum: InteractionActionEnums,
        required: true,
    },
    actionId: {type: Schema.Types.ObjectId, required: true},// "Question Id , answerId"
    actionType: {type: String, enum:["question","answer"], required: true},
},{
    timestamps : true
});

const Intraction = models?.Intraction || model<Intraction>("Intraction",IntractionSchema)

export default Intraction;