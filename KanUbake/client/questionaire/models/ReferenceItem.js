/*
  ReferenceItem Model

  This class represents one reference image or reference link added by the user.
  It stores what the user likes about the reference, what should not be copied,
  and optional tags such as colors, shape, decoration, overall style, or lettering.

  Reference items help the bakery understand the desired visual direction.
*/

export class ReferenceItem {
  constructor(type) {
    this.id = crypto.randomUUID();

    this.type = type; // "image" or "link"

    this.file = null;
    this.fileName = "";
    this.filePreviewUrl = "";

    this.url = "";

    this.likes = "";
    this.dislikes = "";
    this.tags = [];
  }

  setImageFile(file, previewUrl) {
    this.type = "image";
    this.file = file;
    this.fileName = file ? file.name : "";
    this.filePreviewUrl = previewUrl || "";
    this.url = "";
  }

  setUrl(url) {
    this.type = "link";
    this.url = url;
    this.file = null;
    this.fileName = "";
    this.filePreviewUrl = "";
  }

  updateLikes(likes) {
    this.likes = likes;
  }

  updateDislikes(dislikes) {
    this.dislikes = dislikes;
  }

  toggleTag(tag) {
    if (this.tags.includes(tag)) {
      this.tags = this.tags.filter((currentTag) => currentTag !== tag);
    } else {
      this.tags.push(tag);
    }
  }

  isValid() {
    if (this.type === "image") {
      return this.file !== null;
    }

    if (this.type === "link") {
      try {
        const url = new URL(this.url.trim());
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }

    return false;
  }
}
