/*
  Questionnaire State

  This class manages the current state of the questionnaire.
  It keeps track of the current chapter, the user's selected answers,
  and the current CakeRequest object.

  It provides methods for updating form values, moving between chapters,
  resetting parts of the form, and retrieving the current request data.
*/

import { CakeRequest } from "../models/CakeRequest.js";
import { questionnaireChapters } from "../data/questionnaireChapters.js";

export class QuestionnaireState {
    constructor() {
        this.currentChapterIndex = 0;
        this.cakeRequest = new CakeRequest();
    }

    getCurrentChapter() {
        return questionnaireChapters[this.currentChapterIndex];
    }

    getCurrentChapterIndex() {
        return this.currentChapterIndex;
    }

    getChapterCount() {
        return questionnaireChapters.length;
    }

    getCakeRequest() {
        return this.cakeRequest;
    }

    setCakeRequest(cakeRequest) {
        if (!(cakeRequest instanceof CakeRequest)) {
            throw new Error("The loaded request must be a CakeRequest instance.");
        }

        this.cakeRequest = cakeRequest;
    }

    isFirstChapter() {
        return this.currentChapterIndex === 0;
    }

    isLastChapter() {
        return this.currentChapterIndex === questionnaireChapters.length - 1;
    }

    goToNextChapter() {
        if (!this.isLastChapter()) {
            this.currentChapterIndex++;
        }
    }

    goToPreviousChapter() {
        if (!this.isFirstChapter()) {
            this.currentChapterIndex--;
        }
    }

    goToChapter(chapterIndex) {
        if (chapterIndex >= 0 && chapterIndex < questionnaireChapters.length) {
            this.currentChapterIndex = chapterIndex;
        }
    }

    updateField(fieldName, value) {
        if (fieldName in this.cakeRequest) {
            this.cakeRequest[fieldName] = value;
            this.cakeRequest.markUpdated();
        }
    }

    updateMultipleFields(values) {
        Object.entries(values).forEach(([fieldName, value]) => {
            this.updateField(fieldName, value);
        });
    }

    addToArrayField(fieldName, value) {
        if (Array.isArray(this.cakeRequest[fieldName])) {
            this.cakeRequest[fieldName].push(value);
            this.cakeRequest.markUpdated();
        }
    }

    removeFromArrayField(fieldName, value) {
        if (Array.isArray(this.cakeRequest[fieldName])) {
            this.cakeRequest[fieldName] = this.cakeRequest[fieldName].filter(
                (item) => item !== value
            );
            this.cakeRequest.markUpdated();
        }
    }

    toggleArrayValue(fieldName, value) {
        if (!Array.isArray(this.cakeRequest[fieldName])) {
            return;
        }

        if (this.cakeRequest[fieldName].includes(value)) {
            this.removeFromArrayField(fieldName, value);
        } else {
            this.addToArrayField(fieldName, value);
        }
    }

    resetRequest() {
        this.currentChapterIndex = 0;
        this.cakeRequest = new CakeRequest();
    }
}