import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listThreads from "./tools/list-threads";
import getThreadMessages from "./tools/get-thread-messages";
import createThread from "./tools/create-thread";

// Use the direct Supabase issuer, not the .lovable.cloud proxy. Read from the
// Vite-inlined project ref; the fallback keeps the URL well-formed during the
// throwaway manifest-extract eval (no real token verifies against it).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "drivable-mcp",
  title: "Drivable",
  version: "0.1.0",
  instructions:
    "Tools for Drivable, a driver-education coach. Use list_threads and get_thread_messages to review a user's chat history, and create_thread to start a new coaching thread.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listThreads, getThreadMessages, createThread],
});
