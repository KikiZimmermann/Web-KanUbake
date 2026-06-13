/*
  Email API

  Sends the cake questionnaire draft to a customer email address via Resend.
*/

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function buildEmailHtml(summary) {
    const sections = summary
        .map((section) => {
            const rows = section.items
                .filter((item) => item && item.value && item.value !== "Not specified")
                .map(
                    (item) => `
                <tr>
                    <td style="padding:6px 12px;font-weight:600;color:#5c3d2e;width:40%;vertical-align:top;">${item.label}</td>
                    <td style="padding:6px 12px;color:#333;">${item.value}</td>
                </tr>`
                )
                .join("");

            if (!rows) return "";

            return `
            <div style="margin-bottom:24px;">
                <h2 style="background:#f7c5d5;color:#5c3d2e;margin:0;padding:10px 16px;border-radius:6px 6px 0 0;font-size:16px;">
                    ${section.title}
                </h2>
                <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:0 0 6px 6px;overflow:hidden;">
                    ${rows}
                </table>
            </div>`;
        })
        .join("");

    return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fdf6f0;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#5c3d2e;margin:0;">KanUbake</h1>
            <p style="color:#888;margin:4px 0 0;">Your Cake Design Draft</p>
        </div>
        ${sections}
        <p style="color:#888;font-size:13px;text-align:center;margin-top:32px;">
            This is a draft summary of your cake request. We will be in touch soon!
        </p>
    </div>`;
}

function registerEmailApi(app) {
    app.post("/api/email/send-draft", async (request, response) => {
        const { customerEmail, customerName, summary } = request.body;

        if (!customerEmail || !summary) {
            return response.status(400).json({ error: "customerEmail and summary are required." });
        }

        try {
            await transporter.sendMail({
                from: `"KanUbake" <${process.env.EMAIL_USER}>`,
                to: customerEmail,
                subject: "Your KanUbake Cake Design Draft",
                html: buildEmailHtml(summary)
            });

            response.json({ success: true });
        } catch (err) {
            console.error("Nodemailer error:", err);
            response.status(500).json({ error: "Failed to send email." });
        }
    });
}

module.exports = { registerEmailApi };
