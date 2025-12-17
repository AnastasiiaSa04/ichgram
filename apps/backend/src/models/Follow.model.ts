import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  _id: mongoose.Types.ObjectId;
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower is required'],
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.model<IFollow>('Follow', followSchema);
