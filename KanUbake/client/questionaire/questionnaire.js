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
import { EmailApiService } from "./services/api/EmailApiService.js";
import { SummaryBuilder } from "./services/SummaryBuilder.js";
import { CakeRequestApiService } from "./services/api/CakeRequestApiService.js";


const token = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", async () => {
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
    const emailApiService = new EmailApiService();

    const summaryBuilder = new SummaryBuilder();
    let validationErrorsActive = false;
    let maxUnlockedChapter = 0;

    function updateQuestionnaireNavigation() {
        const currentChapterIndex = state.getCurrentChapterIndex();
        const referencesChapterIndex = state.getChapterCount() - 2;

        progressButtons.forEach((button) => {
            const chapterIndex = Number(button.dataset.chapter);
            const isLocked = chapterIndex > maxUnlockedChapter;

            button.disabled = isLocked;
            button.classList.toggle(
                "active",
                chapterIndex === currentChapterIndex
            );
        });

        if (currentChapterIndex === referencesChapterIndex) {
            nextButton.textContent = "Finish";
        } else {
            nextButton.textContent = "Next";
        }
    }

    function renderQuestionnaire() {
        renderer.render();
        updateQuestionnaireNavigation();
    }

    async function loadSavedCakeRequestIfPresent() {
        const urlParams = new URLSearchParams(window.location.search);
        const cakeRequestId = urlParams.get("cakeRequestId");

        if (!cakeRequestId) {
            return false;
        }

        try {
            const loadedCakeRequest =
                await CakeRequestApiService.loadCakeRequest(cakeRequestId);

            state.setCakeRequest(loadedCakeRequest);

            state.goToChapter(0);

            startScreen.classList.add("hidden");
            wizardScreen.classList.remove("hidden");

            renderQuestionnaire();

            return true;
        } catch (error) {
            console.error("Could not load saved cake request:", error);

            alert("The saved cake request could not be loaded.");

            return false;
        }
    }

    function clearValidationErrors() {
        document.querySelectorAll(".field-error").forEach((element) => {
            element.classList.remove("field-error");
        });

        document.querySelectorAll('[data-validation-error="true"]').forEach((element) => {
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

            const existingMessage = parentField.querySelector('[data-validation-error="true"]');

            if (existingMessage) {
                existingMessage.textContent = messages[index];
                return;
            }

            const errorMessage = document.createElement("p");
            errorMessage.classList.add("field-error-message");
            errorMessage.dataset.validationError = "true";
            errorMessage.textContent = messages[index];

            parentField.appendChild(errorMessage);
        });
    }

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

        const errorMessage = parentField.querySelector('[data-validation-error="true"]');

        if (errorMessage) {
            errorMessage.remove();
        }
    }

    document.addEventListener("change", (event) => {
        const fieldElement = event.target.closest("[data-field]");

        if (!fieldElement) {
            return;
        }

        if (event.target.type === "checkbox") {
            const fieldName = fieldElement.dataset.field;
            const checkedFields = document.querySelectorAll(`input[name="${fieldName}"]:checked`);

            if (checkedFields.length > 0) {
                clearSingleValidationError(fieldName);
            }

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

        if (typeof event.target.value === "string" && event.target.value.trim() !== "") {
            clearSingleValidationError(fieldElement.dataset.field);
        }
    });

    document.addEventListener("questionnaireRendered", () => {
        if (!validationErrorsActive) {
            return;
        }

        const result = validator.validateCurrentChapter();

        clearValidationErrors();

        if (!result.isValid) {
            showValidationErrors(result.fields, result.messages);
            return;
        }

        validationErrorsActive = false;
    });

    startQuestionnaireButton.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        wizardScreen.classList.remove("hidden");

        renderQuestionnaire();
    });

    backButton.addEventListener("click", () => {
        validationErrorsActive = false;
        clearValidationErrors();

        state.goToPreviousChapter();
        renderQuestionnaire();
    });

    nextButton.addEventListener("click", () => {
        const result = validator.validateCurrentChapter();

        clearValidationErrors();

        if (!result.isValid) {
            validationErrorsActive = true;
            showValidationErrors(result.fields, result.messages);
            return;
        }

        validationErrorsActive = false;

        if (state.isLastChapter()) {
            return;
        }

        const nextChapterIndex = state.getCurrentChapterIndex() + 1;
        const isMovingToSummary =
            nextChapterIndex === state.getChapterCount() - 1;

        /*
          Das nächste Kapitel wird erst freigeschaltet,
          nachdem das aktuelle Kapitel erfolgreich validiert wurde.
        */
        maxUnlockedChapter = Math.max(
            maxUnlockedChapter,
            nextChapterIndex
        );

        if (isMovingToSummary) {
            const cakeRequest = state.getCakeRequest();

            cakeRequest.markCompleteDraft();
            draftStorageService.saveDraft(cakeRequest);
        }

        state.goToNextChapter();
        renderQuestionnaire();
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

        if (!token) {
            alert("Log in to save it to your account.");
        }
        else if (savedDraft.status === "draft_complete") {
            alert("Draft saved as complete.");
        } else {
            alert("Draft saved as incomplete. You can continue editing it later.");
        }
    });

    document.addEventListener("click", async (event) => {
        if (event.target.id !== "sendDraftEmailButton") return;

        const emailInput = document.getElementById("draftEmailInput");
        const statusEl = document.getElementById("emailDraftStatus");
        const email = emailInput.value.trim();

        if (!email) {
            statusEl.textContent = "Please enter an email address.";
            statusEl.className = "email-draft-status email-draft-status--error";
            return;
        }

        const button = event.target;
        button.disabled = true;
        button.textContent = "Sending…";
        statusEl.textContent = "";
        statusEl.className = "email-draft-status";

        try {
            const cakeRequest = state.getCakeRequest();
            const summary = summaryBuilder.buildSummary(cakeRequest);

            const [allergensResult, nutrientsResult] = await Promise.allSettled([
                CakeRequestApiService.nutrientsCakeRequest(cakeRequest),
                CakeRequestApiService.analyzeCakeRequest(cakeRequest)
            ]);

            const allergens = allergensResult.status === "fulfilled" ? allergensResult.value.allergens : null;
            const analysis = nutrientsResult.status === "fulfilled" ? nutrientsResult.value.analysis : null;

            await emailApiService.sendDraft({ customerEmail: email, summary, allergens, analysis });
            statusEl.textContent = "Draft sent! Check your inbox.";
            statusEl.className = "email-draft-status email-draft-status--success";
        } catch {
            statusEl.textContent = "Failed to send. Please try again.";
            statusEl.className = "email-draft-status email-draft-status--error";
        } finally {
            button.disabled = false;
            button.textContent = "Send";
        }
    });

    cancelButton.addEventListener("click", () => {
        const shouldCancel = confirm(
            "Do you really want to cancel this request? Unsaved information will be lost."
        );

        if (shouldCancel) {
            validationErrorsActive = false;
            clearValidationErrors();

            state.resetRequest();
            maxUnlockedChapter = 0;

            updateQuestionnaireNavigation();

            wizardScreen.classList.add("hidden");
            startScreen.classList.remove("hidden");
        }
    });

    progressButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const chapterIndex = Number(button.dataset.chapter);

            if (chapterIndex > maxUnlockedChapter) {
                return;
            }

            validationErrorsActive = false;
            clearValidationErrors();

            state.goToChapter(chapterIndex);
            renderQuestionnaire();
        });
    });

    updateQuestionnaireNavigation();
    await loadSavedCakeRequestIfPresent();
});