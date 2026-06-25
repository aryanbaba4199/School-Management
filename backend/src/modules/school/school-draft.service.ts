import { RegistrationDraftModel } from './draft.model';

export class SchoolDraftService {
  /**
   * Finds a draft registration by admin email.
   */
  async findDraftByEmail(adminEmail: string) {
    return await RegistrationDraftModel.findOne({ adminEmail: adminEmail.toLowerCase() });
  }

  /**
   * Saves or updates a draft registration.
   */
  async saveDraft(draftData: { adminEmail: string; [key: string]: unknown }) {
    const { adminEmail } = draftData;
    if (!adminEmail) {
      throw new Error('adminEmail is required to save a draft.');
    }
    return await RegistrationDraftModel.findOneAndUpdate(
      { adminEmail: adminEmail.toLowerCase() },
      { ...draftData, adminEmail: adminEmail.toLowerCase() },
      { new: true, upsert: true }
    );
  }

  /**
   * Deletes a draft registration by admin email.
   */
  async deleteDraft(adminEmail: string) {
    return await RegistrationDraftModel.deleteOne({ adminEmail: adminEmail.toLowerCase() });
  }
}
