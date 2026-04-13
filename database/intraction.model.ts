
import { model, models, Schema, Types } from "mongoose";

export interface IIntraction {
    user: Types.ObjectId;
    action: string;
    actionId: Types.ObjectId,
    actionType: "question"| "answer";
}

const IntractionSchema  = new Schema<IIntraction>({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    action: {type:String, required: true},
    actionId: {type: Schema.Types.ObjectId, required: true},
    actionType: {type: String, enum:["question","answer"], required: true},
},{
    timestamps : true
});

const Intraction = models?.Intraction || model<IIntraction>("Intraction",IntractionSchema)

export default Intraction;