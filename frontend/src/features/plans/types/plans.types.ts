export interface ISubscriptionPlan {
  _id: string;
  name: string;
  code: string;
  price: number;
  maxStudents: number;
  features: {
    attendanceEnabled: boolean;
    onlineExamEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    parentAppEnabled: boolean;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
