# Managing website content

Everything on the website that is not part of the design lives here and in `public/`.
Add, edit or delete files, commit and push to GitHub, and Vercel redeploys automatically.
**You never need to edit source code in `src/`.**

Run `bun run check:content` (or `node scripts/check-content.mjs`) before committing. It finds broken JSON, missing images/PDFs and oversized files.

## Folder map

| What | Where the text/data goes | Where the files go |
| --- | --- | --- |
| Blog / personal writings | `content/blog/<name>.md` | images: `public/images/blog/` · audio: `public/audio/` · PDFs: `public/documents/blog/` |
| Projects, Books, Research, Articles, Editorials, Opinion pieces, Talk shows, Seminars | `content/external/<section>.json` | thumbnails: `public/images/external/` |
| Notices | `content/notices.json` | PDFs: `public/documents/notices/` |
| Press releases | `content/press-releases.json` | PDFs: `public/documents/press-releases/` |
| Activities (photo gallery) | `content/activities.json` | photos: `public/images/activities/` |
| Other site images | – | `public/images/site/` |
| Other documents | – | `public/documents/other/` |

Templates for every file type are in `content/_examples/`. Anything starting with `_` is never published.
All files in `public/` are served as-is at the same path (`public/images/blog/a.jpg` → `/images/blog/a.jpg`), which also works on cPanel or any static host.

## 1. Publish a blog article

1. Copy `content/_examples/blog-post.md` to `content/blog/my-title.md`. The file name becomes the address: `/writings/my-title`. Use lowercase English letters, numbers and hyphens.
2. Edit the header between the `---` lines:

   | Field | Meaning |
   | --- | --- |
   | `title` | Article title (required) |
   | `date` | `YYYY-MM-DD`; newest first |
   | `excerpt` | Short text on the card (optional; otherwise the first lines are used) |
   | `cover` | Cover image file name from `public/images/blog/` (optional) |
   | `coverAlt` | Description of the cover for screen readers (optional) |
   | `tags` | `[one, two]` (optional) |
   | `draft` | `true` hides the article |
   | `slug` | Optional custom address |

3. Write the article in Markdown below the header. Bengali works out of the box.
4. Put pictures in `public/images/blog/` and commit both files.

### Writing syntax

| You want | Write |
| --- | --- |
| Section / sub-section heading | `## Heading` / `### Sub-heading` |
| Bold, italic | `**bold**`, `*italic*` |
| Link | `[text](https://example.com)` |
| Lists | `- item` or `1. item` (indent two spaces to nest) |
| Quotation | `> quoted text` |
| Image with caption | `![description for screen readers](file.jpg "Visible caption")` |
| Many images | one image line after another |
| YouTube | a YouTube link alone on a line, or `::youtube[link]{caption="..."}` |
| Audio | `::audio[file.mp3]{title="..."}` (file in `public/audio/`, or a direct `https://` link) |
| PDF | `::pdf[file.pdf]{title="..."}`; add `embed="true"` to show it inline |
| Table, code block, divider | standard Markdown (`\| a \| b \|`, triple backticks, `---`) |

A bare file name in an image, audio or PDF reference is looked up in the matching folder; a path starting with `/` or `https://` is used as written. Raw HTML is intentionally not supported.

## 2. External-link sections

Each section has one file in `content/external/`: `projects.json`, `books.json`, `research.json`, `articles.json`, `editorials.json`, `opinion-pieces.json`, `talk-shows.json`, `seminars.json`. A file is a list; add one block per entry (see `_examples/external-item.json`):

```json
[
  {
    "title": "Title of the item",
    "category": "Journal article",
    "description": "One or two sentences.",
    "url": "https://example.com/the-original-page",
    "image": "thumbnail.jpg",
    "source": "Publication name",
    "date": "2026-11-13"
  }
]
```

`title` and `url` are required; everything else is optional. Remove a block (or add `"hidden": true`) to remove an entry. Separate blocks with commas, and keep the whole list inside `[ ]`.

## 3. Notices and press releases

1. Put the PDF in `public/documents/notices/` (or `public/documents/press-releases/`).
2. Add an entry to `content/notices.json` (or `content/press-releases.json`):

```json
[
  { "title": "Heading", "date": "2026-11-13", "description": "Optional", "pdf": "file-name.pdf" }
]
```

## 4. Activities photographs

1. Put the photo in `public/images/activities/` (about 1600 px wide and under 500 KB is plenty).
2. Add an entry to `content/activities.json`:

```json
[
  { "image": "file.jpg", "caption": "Caption", "activity": "Activity name", "date": "2026-11-13", "location": "Optional" }
]
```

Photos with the same `activity` are grouped together; groups are ordered newest first.

## 5. Keeping the deployment light

- Images: resize before uploading (about 1600 px wide for photos, 1200 px for covers) and aim for under 500 KB each. Use JPG for photographs.
- Do not store videos in the repository. Upload to YouTube and use the YouTube link.
- Keep audio short and compressed (MP3), or host it elsewhere and link to it.
- Large PDFs are fine but each should stay under about 5 MB.

## 6. CV requests

The CV is never published. Visitors use the form at `/cv-request`; the request arrives (subject "CV request — name") through the same kind of hosted form as the contact form, and you reply manually. Optional settings (all `VITE_` environment variables, only needed to send CV requests to a different inbox than the contact form):
`VITE_CV_REQUEST_PROVIDER`, `VITE_CV_REQUEST_KEY` (Web3Forms), `VITE_CV_REQUEST_ENDPOINT` (Formspree).
By default the CV form uses the same provider settings as the contact form.
