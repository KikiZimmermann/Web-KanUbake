/*
  File Utilities

  This file contains helper functions for checking uploaded files,
  especially reference images for the cake design questionnaire.
*/

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export const maxImageSizeInBytes = 5 * 1024 * 1024; // 5 MB

export function isAllowedImageType(file) {
    return allowedImageTypes.includes(file.type);
}

export function isAllowedImageSize(file) {
    return file.size <= maxImageSizeInBytes;
}

export function validateImageFile(file) {
    const messages = [];

    if (!file) {
        messages.push("No file selected.");
    }

    if (file && !isAllowedImageType(file)) {
        messages.push("Only JPG, PNG and WebP images are allowed.");
    }

    if (file && !isAllowedImageSize(file)) {
        messages.push("The image must be smaller than 5 MB.");
    }

    return {
        isValid: messages.length === 0,
        messages: messages
    };
}

export function createImagePreviewUrl(file) {
    if (!file) {
        return "";
    }

    return URL.createObjectURL(file);
}

export function revokeImagePreviewUrl(previewUrl) {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
}

export function formatFileSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}