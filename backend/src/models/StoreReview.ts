import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreReview extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeReviewSchema = new Schema<IStoreReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: [250, 'Feedback cannot exceed 250 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { __v, ...rest } = ret as Record<string, unknown>;
        void __v;
        return rest;
      },
    },
  },
);

storeReviewSchema.index({ createdAt: -1 });

export const StoreReview = mongoose.model<IStoreReview>('StoreReview', storeReviewSchema);
