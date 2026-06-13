/*
  Email API Service

  Sends the questionnaire draft to the customer via the backend email API.
*/

const API_BASE_URL = "http://localhost:3010";

export class EmailApiService {
    async sendDraft({ customerEmail, customerName, summary }) {
        const response = await fetch(`${API_BASE_URL}/api/email/send-draft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerEmail, customerName, summary })
        });

        if (!response.ok) {
            throw new Error("Failed to send draft email.");
        }

        return await response.json();
    }
}
