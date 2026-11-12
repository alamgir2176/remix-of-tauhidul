---
title: "My first essay"
date: 2026-11-13
excerpt: "One or two sentences shown on the article card and in link previews."
cover: my-first-essay-cover.jpg
coverAlt: "Describe the cover image for screen readers"
tags: [philosophy, reflections]
draft: false
---

Copy this file to `content/blog/my-first-essay.md` (the file name becomes the web address:
`/writings/my-first-essay`). Put the cover image and any other pictures in `public/images/blog/`.

## A section heading

Normal paragraphs, **bold**, *italic*, ~~strikethrough~~ and [external links](https://example.com).

### A sub-heading

- Bullet one
- Bullet two
  - A nested bullet

1. First step
2. Second step

> A quotation is written with a greater-than sign.

![Alt text for screen readers](my-first-essay-photo.jpg "This text becomes the visible caption")

Several images in a row are simply several image lines, each with its own caption:

![First photo](photo-one.jpg "Caption one")
![Second photo](photo-two.jpg "Caption two")

## Video, audio and PDF

Paste a YouTube link on its own line, or use the directive to add a caption:

::youtube[https://www.youtube.com/watch?v=dQw4w9WgXcQ]{caption="A caption under the video"}

Audio files live in `public/audio/` (keep them small) or use any direct `https://` link to an .mp3:

::audio[interview.mp3]{title="Interview, part one"}

PDFs live in `public/documents/blog/`. Show a download card, or add `embed="true"` to show the PDF inline too:

::pdf[my-paper.pdf]{title="Read the full paper (PDF)"}

| Column A | Column B |
| -------- | -------- |
| Tables   | work too |
