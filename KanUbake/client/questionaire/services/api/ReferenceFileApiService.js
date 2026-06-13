export class ReferenceFileApiService {
    static async uploadReferenceFile(
        cakeRequestId,
        file,
        sortOrder
    ) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("sortOrder", sortOrder);

        const token =
            localStorage.getItem("accessToken");

        const response = await fetch(
            `http://localhost:3010/api/cake-requests/${cakeRequestId}/reference-files`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Reference image upload failed.");
        }

        return response.json();
    }
}