# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploy from GitHub to Netlify or Vercel

Keep TanStack Start's server rendering and Nitro adapter. Do not add an SPA
rewrite to `index.html`: this app has one page with section hashes; fragments
are not sent to the server, so `/#about` and `/#contact` refresh at `/`.

Import the connected repository. Use `bun install` and `bun run build`.
Set `NITRO_PRESET=netlify` on Netlify or `NITRO_PRESET=vercel` on Vercel.
Netlify's public output is `dist/client` and its generated functions are in
`.netlify/functions-internal`; Vercel uses the generated `.vercel/output`.
The Lovable editor keeps its own managed hosting target.

### Public homepage address

Set `VITE_SITE_URL` to the final HTTPS website address on your chosen host,
then redeploy. The homepage uses that origin for its canonical and Open Graph
address. Until configured, it omits those tags rather than publishing a relative
or invented address. Its existing title and descriptions remain available.

Before launch, confirm message receipt in the selected provider, decide who
can access messages and how long they are retained, and supply those verified
practices for a contact privacy notice. No retention or privacy promises are
invented by the application.

### Portraits on external hosting

Lovable's relative media URLs are not served by Vercel or Netlify. Before an
external deployment, put the original three remaining portraits on that host
at `/portraits/portrait-navy-2.jpg`, `/portraits/portrait-navy.jpg` and
`/portraits/portrait-studio-wide.jpg` and set
`VITE_PORTRAIT_BASE_URL=/portraits`. Alternatively use an HTTPS media-folder
URL with those same filenames. The light-blazer portrait is not used.
Keep the existing asset pointers for Lovable previews.

### Contact delivery without a database

**Netlify (no email required):** set `VITE_CONTACT_PROVIDER=netlify`, enable
form detection in Netlify, then deploy. The static `public/__forms.html`
registers the fields; the visible form posts to that path to bypass SSR.
Messages appear in Netlify's Forms area. Do not add email notifications.
Submit a real test after deployment and confirm it appears there.

**Email delivery on Vercel or Netlify (recommended, free):** get an access key
at https://web3forms.com using your email address, then set
`VITE_CONTACT_PROVIDER=web3forms` and `VITE_WEB3FORMS_KEY=<your key>` in the
host's environment variables. Every message is emailed to that address.

**Alternative:** create a Formspree form, set `VITE_CONTACT_PROVIDER=formspree`
and `VITE_FORMSPREE_ENDPOINT` to its real `https://formspree.io/f/...` URL.
Use the provider's inbox and disable email notifications in its settings.
This setup is pending until a real endpoint is supplied; no placeholder
endpoint is used. Confirm a test in the provider's inbox before going live.

**Lovable preview:** the default `cloud` provider preserves existing validated
contact storage in Lovable Cloud. No owner email notifications are enabled.
External form providers require no application database credentials.

Environment variables starting with `VITE_` are public build-time settings;
never place a private key in them. Redeploy after changing them. External
deployment and hosted inbox delivery cannot be verified from a local preview.
