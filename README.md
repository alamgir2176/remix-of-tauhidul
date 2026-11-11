Md Tauhidul Islam

Personal Portfolio Website

Welcome to my personal portfolio website.

This project is built with modern web technologies and deployed on Vercel.

🌐 Live Website: "tauhidul.vercel.app" (https://tauhidul.vercel.app)

---

🛠️ Built With

- TanStack Start — Application framework
- TypeScript — Programming language
- React — UI library
- Tailwind CSS — Styling framework

---

💻 Local Development

To run the project on your local machine, you need Node.js and Bun installed.

1. Clone the project

git clone <repository-url>
cd <project-directory>

2. Install dependencies

bun install

3. Start the development server

bun run dev

---

🚀 Deployment

This project supports deployment to Vercel and Netlify.

Keep TanStack Start's server rendering and Nitro adapter enabled. Do not add an SPA rewrite to "index.html". This application uses section hashes, and routes such as "/#about" and "/#contact" should refresh correctly.

Use the following build commands:

bun install
bun run build

Configure the appropriate Nitro preset:

Hosting Platform| Environment Variable
Vercel| "NITRO_PRESET=vercel"
Netlify| "NITRO_PRESET=netlify"

- Netlify public output: "dist/client"
- Netlify generated functions: ".netlify/functions-internal"
- Vercel output: ".vercel/output"

The Lovable editor maintains its own managed hosting target.

---

🌐 Website URL Configuration

Set the following environment variable to your final HTTPS website address:

VITE_SITE_URL=https://your-domain.com

This value is used for the homepage's canonical URL and Open Graph metadata.

Redeploy after changing the environment variable.

---

🖼️ Portrait Image Configuration

For external hosting on Vercel or Netlify, the original portrait images must be available at these paths:

/portraits/portrait-navy-2.jpg
/portraits/portrait-navy.jpg
/portraits/portrait-studio-wide.jpg

Configure the image base path:

VITE_PORTRAIT_BASE_URL=/portraits

Alternatively, use an HTTPS media-folder URL containing the same filenames.

Keep the existing asset pointers for Lovable previews. The light-blazer portrait is not used.

---

📩 Contact Form Configuration

The project supports three contact form providers.

1. Web3Forms — Email Delivery

For Vercel or Netlify, Web3Forms can deliver submitted messages to your email address.

1. Create an access key at "Web3Forms" (https://web3forms.com).
2. Add these environment variables to your hosting platform:

VITE_CONTACT_PROVIDER=web3forms
VITE_WEB3FORMS_KEY=<your-access-key>

3. Redeploy and submit a test message.
4. Confirm that the message arrives in your email.

2. Netlify Forms

Set:

VITE_CONTACT_PROVIDER=netlify

Enable form detection in Netlify and deploy the project.

The static "public/__forms.html" file registers the form fields. Submitted messages appear in the Netlify Forms area.

Submit a test message and confirm that it appears there.

3. Formspree

Create a form at "Formspree" (https://formspree.io) and configure:

VITE_CONTACT_PROVIDER=formspree
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/...

Replace the endpoint with your actual Formspree form URL.

Use the provider's inbox and disable email notifications in its settings. Test the form before launch.

Lovable Preview

The default "cloud" provider preserves the existing validated contact storage in Lovable Cloud. Owner email notifications are not enabled.

External form providers do not require application database credentials.

---

🔐 Environment Variables & Security

- Variables beginning with "VITE_" are public build-time settings.
- Never store private API keys or other private credentials in "VITE_" variables.
- Redeploy after changing environment variables.
- Verify contact form delivery on the deployed website; local previews cannot confirm external hosting or inbox delivery.

---

📌 Before Launch

- [ ] Confirm the website URL configuration.
- [ ] Verify all portrait image paths.
- [ ] Configure the contact form provider.
- [ ] Submit a test contact message.
- [ ] Confirm successful message delivery.
- [ ] Check the deployed website after redeployment.

---

Live Portfolio: https://tauhidul.vercel.appapp
