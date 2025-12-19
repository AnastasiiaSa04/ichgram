import mongoose, { Document, Schema } from 'mongoose';

export interface ICommentLike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentLikeSchema = new Schema<ICommentLike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

export const CommentLike = mongoose.model<ICommentLike>('CommentLike', commentLikeSchema);




