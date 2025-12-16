import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);
