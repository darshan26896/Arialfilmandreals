# How to add your own photos & videos

Everything the site shows lives in two folders and one list:

```
public/
  images/   ← your photos (and video poster frames)
  videos/   ← your video clips (MP4)
src/
  data.ts   ← the LIBRARY list that says what appears on the site
```

---

## 1. The fastest way — just replace a file (no code at all)

Every image is loaded by filename. Upload a new file **with the same name** and it
replaces the old one everywhere it is used.

| To replace… | Upload your file as |
|---|---|
| The big hero aerial | `public/images/hero-sector-grid.jpg` |
| The drone-over-stepwell shot | `public/images/neo-stepwell.jpg` |
| The villa / property frame | `public/images/plate-villa.jpg` |
| The Navratri / event frame | `public/images/plate-garba.jpg` |
| The construction frame | `public/images/plate-construction.jpg` |
| The riverfront frame | `public/images/plate-riverfront.jpg` |
| The iPhone / rig frame | `public/images/phone-rig.jpg` |
| The wedding mandap frame | `public/images/lib-mandap.jpg` |
| The rooftop reel frame | `public/images/lib-rooftop.jpg` |
| The night event frame | `public/images/lib-night.jpg` |

Keep the extension `.jpg` and the spelling exactly the same.

---

## 2. Adding a brand-new photo

1. Upload the image into **`public/images/`** — e.g. `my-new-shot.jpg`.
2. Open **`src/data.ts`**, find `export const LIBRARY`, and copy one block:

```ts
{
  id: "L11",
  kind: "photo",
  title: "Bungalow reveal",
  place: "Sector 23, Gandhinagar",
  meta: "Still · 12 MP · 18:20 IST",
  img: "images/my-new-shot.jpg",
  tags: ["photo", "property"],
  ratio: "aspect-[4/3]",
},
```

3. Save and push. It shows in the Library automatically.

**Useful values**

- `tags` decides which filter buttons show it: `photo`, `video`, `reels`,
  `property`, `events`, `heritage`.
- `ratio` is the tile shape: `aspect-[3/4]` tall (reels), `aspect-[4/3]` standard,
  `aspect-[16/10]` wide (films).
- `kind` is either `"photo"` or `"video"`.

---

## 3. Adding a video clip

1. Upload an **MP4** into **`public/videos/`** — e.g. `villa-reveal.mp4`.
2. Upload a **poster frame** (any still from the clip) into `public/images/`.
3. In `src/data.ts`, add:

```ts
{
  id: "L12",
  kind: "video",
  title: "Villa reveal",
  place: "Sargasan",
  meta: "00:22 · 4K/30 · DJI Neo",
  img: "images/villa-reveal-poster.jpg",
  video: "videos/villa-reveal.mp4",
  tags: ["video", "property"],
  ratio: "aspect-[16/10]",
},
```

> If the MP4 is missing, the site automatically shows the poster frame instead —
> a half-finished library never looks broken.

**Format tips:** MP4 (H.264) plays in every browser. Export at 1080p and keep each
file under about 20 MB (GitHub allows 100 MB per file, but big files slow the page).

---

## 4. Using Dropbox instead (no uploads at all)

Media can live in Dropbox and the site will display it.

1. In Dropbox (or Google Drive / any host): hover the file → **Share** → **Copy link**.
2. Paste that link straight into `img` (for photos) or `video` (for clips) in the
   `LIBRARY` list in `src/data.ts` — the site converts it to a direct link
   automatically, so visitors just see the photo or the video playing.

```ts
{
  id: "L11",
  kind: "video",
  title: "Villa reveal",
  place: "Sargasan",
  meta: "00:22 · 4K/30 · DJI Neo",
  img: "https://www.dropbox.com/s/abc/poster.jpg?dl=0",
  video: "https://www.dropbox.com/s/xyz/villa-reveal.mp4?dl=0",
  tags: ["video", "property"],
  ratio: "aspect-[16/10]",
},
```

- Every file must be set to **"Anyone with the link can view"** or it will not load.
- Videos play straight from the link, so the GitHub 100 MB file limit does not apply.
- Dropbox links are converted automatically; other hosts need a direct/raw link.

---

## 5. Getting files onto GitHub

### A. On github.com (no software to install)

1. Open your repository → `public` → `images` → **Add file → Upload files**.
2. Drag your JPGs in, then **Commit changes** to `main`.
3. For videos: create the folder first with **Add file → Create new file** →
   type `videos/.gitkeep` → commit, then upload MP4s into it.
4. To edit `src/data.ts`, click the file → ✏️ pencil → change → commit.
5. The **Actions** tab rebuilds the site in about a minute.

### B. On your computer

```bash
git pull
cp ~/Desktop/shoot/*.jpg public/images/
cp ~/Desktop/shoot/*.mp4 public/videos/
git add .
git commit -m "Add new gallery media"
git push
```

---

## 6. Checklist before you push

- [ ] Filenames have **no spaces** — `villa-reveal.jpg`, not `villa reveal.jpg`
- [ ] The path in `data.ts` matches exactly, e.g. `images/villa-reveal.jpg`
- [ ] Video is `.mp4`, poster is `.jpg`
- [ ] Dropbox links are set to "Anyone with the link can view"
- [ ] Check the live site after the Actions build finishes
