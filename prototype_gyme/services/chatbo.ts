const API_BASE = "https://ihateskil-fitzone-chatbot.hf.space";
const API_KEY = "3sygZYEuW_Kqz8sUp-HqGTHAI6wAQAO5ZpuDN_Lz4cU";
const HF_TOKEN = "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";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function fetchChatStream(
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} ${errText}`);
    }

    if (!response.body) {
      throw new Error("Response body is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunk = decoder.decode(value, {
          stream: !readerDone,
        });

        onChunk(chunk);
      }
    }

    onComplete();
  } catch (error: unknown) {
    console.error("Chat Stream Error:", error);

    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError("Failed to connect to FitZone API.");
    }
  }
}