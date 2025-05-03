# Image Attachment Implementation Plan

1.  **Update Shared Types:**
    *   Modify the `Message` type in `src/lib/sessions.ts` to include an optional `images` field, likely an array of base64 encoded strings (`images?: string[]`). This will allow us to store images associated with user messages in the session history.
    *   Review the shared `ChatRequest` type (likely defined or used within `src/lib/chat/index.ts`). Ensure it can accommodate image data. We might need to adjust it or rely on strategy-specific request shaping within each implementation.

2.  **Update Frontend (`src/routes/sessions/[id]/Prompt.svelte` & `+page.svelte`):**
    *   In `Prompt.svelte`, modify the `submit` function:
        *   Filter `attachments` to get `ImageAttachment`s.
        *   Extract the `dataUrl` from each image attachment.
        *   Pass these `dataUrl`s (base64 strings) along with the text prompt when calling `handleSubmit`.
    *   In `+page.svelte` (or wherever `handleSubmit` is defined and the chat strategy is invoked):
        *   Receive the images from the `Prompt` component.
        *   Pass the images to the `chat` method of the selected strategy (`OllamaStrategy` or `OpenAIStrategy`).

3.  **Update Ollama Strategy (`src/lib/chat/ollama.ts`):**
    *   The Ollama JS library's `ChatRequest` type already supports an `images: string[]` field.
    *   Modify the `chat` method in `OllamaStrategy` to accept an optional `images` parameter.
    *   If images are provided, include them in the `images` field of the `payload` sent to the `/api/chat` endpoint.

4.  **Update OpenAI Strategy (`src/lib/chat/openai.ts`):**
    *   Modify the `chat` method in `OpenAIStrategy` to accept an optional `images` parameter.
    *   Inside the `chat` method, transform the `payload.messages` before sending them to the OpenAI API:
        *   For the *last* user message in the `payload.messages` array (which corresponds to the current prompt): If images are provided, change its structure from `{ role: 'user', content: string }` to `{ role: 'user', content: [ { type: 'text', text: string }, { type: 'image_url', image_url: { url: string } }, ... ] }`. Map each provided base64 `dataUrl` to an `image_url` object.
        *   Ensure other messages in the history remain in their original format unless the API requires a consistent multimodal format for the entire history (consult OpenAI documentation).

5.  **Update E2E Tests (`tests/session-interaction.test.ts`):**
    *   Add new tests specifically for image attachments:
        *   Verify the "Attach image" button exists and works (simulating file selection might be tricky, focus on the state change).
        *   Test adding an image attachment and verifying it appears in the UI with its name and a preview.
        *   Test deleting an image attachment.
        *   Test sending a prompt with an image:
            *   Mock the `**/chat` route for both Ollama and OpenAI.
            *   Intercept the request payload and assert that the `images` field (Ollama) or correctly structured multimodal `content` (OpenAI) is present when an image was attached.
            *   Verify the prompt text is also sent correctly.
        *   (Optional) Test sending *multiple* images. 
