import { CONFIG } from "@/core/config";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 180_000;

type SubmitResponse = {
  request_id: string;
  status_url: string;
  response_url: string;
};
type StatusResponse = { status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authHeaders(): HeadersInit {
  if (!CONFIG.FAL_KEY) {
    throw new Error("FAL_KEY is not configured");
  }
  return { Authorization: `Key ${CONFIG.FAL_KEY}` };
}

/**
 * Submit a job to fal's async queue, poll the returned status URL until it
 * completes, then fetch the result. Callers await the finished payload and
 * never see the polling.
 */
export async function runFalQueue<T>(
  modelId: string,
  input: Record<string, unknown>,
): Promise<{ requestId: string; data: T }> {
  const submit = await fetch(`https://queue.fal.run/${modelId}`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!submit.ok) {
    const detail = await submit.text().catch(() => "");
    throw new Error(`fal submit failed (${submit.status}): ${detail}`);
  }
  const { request_id, status_url, response_url } =
    (await submit.json()) as SubmitResponse;

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const statusResponse = await fetch(status_url, { headers: authHeaders() });
    if (!statusResponse.ok) {
      const detail = await statusResponse.text().catch(() => "");
      throw new Error(`fal status failed (${statusResponse.status}): ${detail}`);
    }
    const { status } = (await statusResponse.json()) as StatusResponse;
    if (status === "COMPLETED") break;
    if (Date.now() > deadline) {
      throw new Error("fal request timed out");
    }
    await delay(POLL_INTERVAL_MS);
  }

  const resultResponse = await fetch(response_url, { headers: authHeaders() });
  if (!resultResponse.ok) {
    const detail = await resultResponse.text().catch(() => "");
    throw new Error(`fal result failed (${resultResponse.status}): ${detail}`);
  }
  return { requestId: request_id, data: (await resultResponse.json()) as T };
}
