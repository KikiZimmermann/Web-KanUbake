/*
  Draft Storage Service

  This class is responsible for saving, loading, and deleting questionnaire drafts.

  For now, drafts are stored in the browser's localStorage.
  Later, this class can be changed to save drafts on a server or in a database
  without changing the rest of the questionnaire logic.
*/

export class DraftStorageService {
    constructor() {
        this.storageKey = "kanubake_cake_request_drafts";
    }

    getAllDrafts() {
        const storedDrafts = localStorage.getItem(this.storageKey);

        if (!storedDrafts) {
            return [];
        }

        try {
            return JSON.parse(storedDrafts);
        } catch (error) {
            console.error("Could not read saved drafts:", error);
            return [];
        }
    }

    saveDraft(cakeRequest) {
        const drafts = this.getAllDrafts();

        const existingDraftIndex = drafts.findIndex(
            (draft) => draft.id === cakeRequest.id
        );

        const draftToSave = {
            ...cakeRequest,
            updatedAt: new Date().toISOString()
        };

        if (existingDraftIndex === -1) {
            drafts.push(draftToSave);
        } else {
            drafts[existingDraftIndex] = draftToSave;
        }

        localStorage.setItem(this.storageKey, JSON.stringify(drafts));

        return draftToSave;
    }

    getDraftById(draftId) {
        const drafts = this.getAllDrafts();

        return drafts.find((draft) => draft.id === draftId) || null;
    }

    deleteDraft(draftId) {
        const drafts = this.getAllDrafts();

        const updatedDrafts = drafts.filter((draft) => draft.id !== draftId);

        localStorage.setItem(this.storageKey, JSON.stringify(updatedDrafts));
    }

    deleteAllDrafts() {
        localStorage.removeItem(this.storageKey);
    }
}