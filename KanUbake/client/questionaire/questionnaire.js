/*
  Questionnaire Entry Point

  This file initializes the cake design questionnaire.
  It connects the form state, renderer, validation logic, draft storage,
  and event listeners.

  This file should stay relatively small and act as the main controller that starts
  the questionnaire and coordinates the other modules.
*/

import { QuestionnaireState } from "./state/QuestionnaireState.js";
import { QuestionnaireRenderer } from "./ui/QuestionnaireRenderer.js";
import { QuestionnaireValidator } from "./validation/QuestionnaireValidator.js";
import { DraftStorageService } from "./services/DraftStorageService.js";

document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("startScreen");
    const wizardScreen = document.getElementById("wizardScreen");
    const startQuestionnaireButton = document.getElementById(
        "startQuestionnaireButton"
    );

    const backButton = document.getElementById("backButton");
    const nextButton = document.getElementById("nextButton");
    const saveButton = document.getElementById("saveButton");
    const cancelButton = document.getElementById("cancelButton");

    const progressButtons = document.querySelectorAll(".progress-step");

    const state = new QuestionnaireState();
    const renderer = new QuestionnaireRenderer(state);
    const validator = new QuestionnaireValidator(state);
    const draftStorageService = new DraftStorageService();

    function clearValidationErrors() {
        document.querySelectorAll(".field-error").forEach((element) => {
            element.classList.remove("field-error");
        });

        document.querySelectorAll(".field-error-message").forEach((element) => {
            element.remove();
        });
    }

    function showValidationErrors(fields, messages) {
        fields.forEach((fieldName, index) => {
            const fieldElement = document.querySelector(`[data-field="${fieldName}"]`);

            if (!fieldElement) {
                return;
            }

            fieldElement.classList.add("field-error");

            const parentField = fieldElement.closest(".form-field") || fieldElement.parentElement;

            if (!parentField) {
                return;
            }

            const existingMessage = parentField.querySelector(".field-error-message");

            if (existingMessage) {
                existingMessage.textContent = messages[index];
                return;
            }

            const errorMessage = document.createElement("p");
            errorMessage.classList.add("field-error-message");
            errorMessage.textContent = messages[index];

            parentField.appendChild(errorMessage);
        });
    }

    startQuestionnaireButton.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        wizardScreen.classList.remove("hidden");

        renderer.render();
    });

    backButton.addEventListener("click", () => {
        clearValidationErrors();

        state.goToPreviousChapter();
        renderer.render();
    });

    nextButton.addEventListener("click", () => {
        const result = validator.validateCurrentChapter();

        if (!result.isValid) {
            showValidationErrors(result.fields, result.messages);
            return;
        }

        clearValidationErrors();

        const nextChapterIndex = state.getCurrentChapterIndex() + 1;
        const isMovingToSummary = nextChapterIndex === state.getChapterCount() - 1;

        if (isMovingToSummary) {
            const cakeRequest = state.getCakeRequest();

            cakeRequest.markCompleteDraft();
            draftStorageService.saveDraft(cakeRequest);
        }

        if (state.isLastChapter()) {
            return;
        }

        state.goToNextChapter();
        renderer.render();
    });

    saveButton.addEventListener("click", () => {
        const cakeRequest = state.getCakeRequest();

        if (state.isLastChapter()) {
            cakeRequest.markCompleteDraft();
        } else {
            cakeRequest.markIncompleteDraft();
        }

        const savedDraft = draftStorageService.saveDraft(cakeRequest);

        console.log("Draft saved:", savedDraft);

        if (savedDraft.status === "draft_complete") {
            alert("Draft saved as complete.");
        } else {
            alert("Draft saved as incomplete. You can continue editing it later.");
        }
    });

    cancelButton.addEventListener("click", () => {
        const shouldCancel = confirm(
            "Do you really want to cancel this request? Unsaved information will be lost."
        );

        if (shouldCancel) {
            clearValidationErrors();

            state.resetRequest();
            wizardScreen.classList.add("hidden");
            startScreen.classList.remove("hidden");
        }
    });

    progressButtons.forEach((button) => {
        button.addEventListener("click", () => {
            clearValidationErrors();

            const chapterIndex = Number(button.dataset.chapter);

            state.goToChapter(chapterIndex);
            renderer.render();
        });
    });
});

function clearSingleValidationError(fieldName) {
    const fieldElement = document.querySelector(`[data-field="${fieldName}"]`);

    if (!fieldElement) {
        return;
    }

    fieldElement.classList.remove("field-error");

    const parentField = fieldElement.closest(".form-field") || fieldElement.parentElement;

    if (!parentField) {
        return;
    }

    const errorMessage = parentField.querySelector(".field-error-message");

    if (errorMessage) {
        errorMessage.remove();
    }
}

document.addEventListener("change", (event) => {
    const fieldElement = event.target.closest("[data-field]");

    if (!fieldElement) {
        return;
    }

    if (event.target.value !== "") {
        clearSingleValidationError(fieldElement.dataset.field);
    }
});

document.addEventListener("input", (event) => {
    const fieldElement = event.target.closest("[data-field]");

    if (!fieldElement) {
        return;
    }

    if (event.target.value.trim() !== "") {
        clearSingleValidationError(fieldElement.dataset.field);
    }
});