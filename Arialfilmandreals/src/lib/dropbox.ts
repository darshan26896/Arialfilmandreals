/**
 * Dropbox helpers.
 *
 * A normal "Copy link" from the Dropbox app looks like
 *   https://www.dropbox.com/s/abc123/clip.mp4?dl=0
 *   https://www.dropbox.com/scl/fi/xyz/file.jpg?rlkey=abc&st=def&dl=0
 * which opens the Dropbox website instead of the file. Turning the link into a
 * direct one lets it be used straight in <img> and <video> tags.
 */

export function isDropbox(url: string): boolean {
  return /dropbox(?:usercontent)?\.com/.test(url);
}

export function toDirectDropbox(url: string): string {
  const trimmed = (url || "").trim();
  if (!isDropbox(trimmed)) return trimmed;
  if (trimmed.includes("dropboxusercontent.com")) return trimmed;

  const [base, query = ""] = trimmed.split("?");
  const params = new URLSearchParams(query);
  params.delete("dl");
  params.delete("raw");
  params.delete("st"); // preview token, not needed for a direct link
  params.set("dl", "1");

  const directBase = base
    .replace("https://www.dropbox.com/", "https://dl.dropboxusercontent.com/")
    .replace("http://www.dropbox.com/", "https://dl.dropboxusercontent.com/")
    .replace("https://dropbox.com/", "https://dl.dropboxusercontent.com/")
    .replace("http://dropbox.com/", "https://dl.dropboxusercontent.com/");

  const qs = params.toString();
  return qs ? `${directBase}?${qs}` : directBase;
}

/** Use this for every user-supplied path in the site. */
export function mediaUrl(url: string): string {
  return isDropbox(url) ? toDirectDropbox(url) : url;
}

/** True when the link points at something that plays rather than shows. */
export function looksLikeVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}
