import { model, models, Schema, Types, Document } from "mongoose";

export interface IAnswers {
author: Types.ObjectId;
question: Types.ObjectId;
content: string;
upvotes: number;
downvotes: number;
}

export interface IAnswersDoc extends IAnswers, Document {}

const AnswersSchema = new Schema<IAnswers>({
 author: {type: Schema.Types.ObjectId, ref: "User", required: true},
 question: {type:  Schema.Types.ObjectId, ref: "Question", required: true},
 content: {type : String, required: true},
 upvotes: {type: Number, default: 0},
 downvotes: {type: Number, default: 0},
},
{timestamps: true}
);

const Answers = models?.Answer || model<IAnswers>("Answer", AnswersSchema);

export default Answers;