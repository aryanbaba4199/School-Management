import { Schema, model, Document, Types, CallbackError } from 'mongoose';

/*------------- User Role Interface -------------*/

export interface IUserRole {
  _id?: Types.ObjectId;
  name: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  access: string[];
}

/*------------- User Document Interface -------------*/

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  userCode: string;
  role: IUserRole;
  schoolId?: Types.ObjectId;
  phone?: string;
  isActive: boolean;
  address?: {
    street?: string;
    city?: Types.ObjectId;
    state?: Types.ObjectId;
    district?: Types.ObjectId;
    pincode?: number;
  };
  parentId?: Types.ObjectId;
  childrenIds?: Types.ObjectId[];
  classId?: Types.ObjectId;
  joinedClassId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  subjects?: Types.ObjectId[];
  regDate?: Date;
  startDate?: Date;
  leaveDate?: Date;
  feeCycle?: 'MONTHLY' | 'YEARLY';
  createdAt: Date;
  updatedAt: Date;
}

/*------------- User Schema Definition -------------*/

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    userCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    role: {
      name: {
        type: String,
        enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
        required: true,
      },
      access: {
        type: [String],
        default: [],
      },
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: Schema.Types.ObjectId, ref: 'City', index: true },
      state: { type: Schema.Types.ObjectId, ref: 'State' },
      district: { type: Schema.Types.ObjectId, ref: 'District' },
      pincode: { type: Number },
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    childrenIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      index: true,
    },
    joinedClassId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        index: true,
      },
    ],
    regDate: { type: Date },
    startDate: { type: Date },
    leaveDate: { type: Date },
    feeCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      default: 'MONTHLY',
    },
  },
  {
    timestamps: true,
  }
);

/*------------- Indexes & Validation -------------*/

// Compound unique index to enforce unique userCode inside a single school tenant
UserSchema.index({ schoolId: 1, userCode: 1 }, { unique: true });

// Enforce schoolId requirement for school level users
UserSchema.pre('save', async function (this: IUser) {
  if (this.role.name !== 'SUPER_ADMIN' && !this.schoolId) {
    throw new Error('schoolId is required for users other than SUPER_ADMIN.');
  }
});

export const UserModel = model<IUser>('User', UserSchema);
