import { createFileRoute, redirect } from "@tanstack/react-router";

/** The CV request lives on the homepage now. Old links and bookmarks are sent to the form there. */
export const Route = createFileRoute("/cv-request")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "request-cv" });
  },
});
