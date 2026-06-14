import { Types } from 'mongoose';

/**
 * Utility to send SMS or push alerts to parents when a student is absent or late.
 * For now, it logs the alert details to the console as a placeholder.
 */
export async function sendParentNotification(
  schoolId: Types.ObjectId,
  studentId: Types.ObjectId,
  type: 'ABSENT' | 'LATE',
  details: { date: Date; time?: string }
): Promise<void> {
  console.log(
    `[NOTIFICATION SUCCESS] School: ${schoolId} | Student: ${studentId} | Type: ${type} | Date: ${details.date.toDateString()}${
      details.time ? ` | Time: ${details.time}` : ''
    }`
  );
}
