import { Campaign, Run, RunRecord } from "../types/campaign";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new APIError(res.status, await res.text());
  }

  return res.json();
}

export const api = {
  // Campaign endpoints
  campaigns: {
    list: () => fetchAPI<Campaign[]>("/campaigns"),
    get: (id: string) => fetchAPI<Campaign>(`/campaigns/${id}`),
    create: (data: Partial<Campaign>) =>
      fetchAPI<Campaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Campaign>) =>
      fetchAPI<Campaign>(`/campaigns/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<void>(`/campaigns/${id}`, {
        method: "DELETE",
      }),
  },

  // Run endpoints
  runs: {
    list: (campaignId: string) =>
      fetchAPI<Run[]>(`/campaigns/${campaignId}/runs`),
    get: (id: string) => fetchAPI<Run>(`/runs/${id}`),
    create: (campaignId: string, data: Partial<Run>) =>
      fetchAPI<Run>(`/campaigns/${campaignId}/runs`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Run>) =>
      fetchAPI<Run>(`/runs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<void>(`/runs/${id}`, {
        method: "DELETE",
      }),
    getRecords: (runId: string) =>
      fetchAPI<RunRecord[]>(`/runs/${runId}/records`),
    uploadCSV: async (runId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/runs/${runId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new APIError(res.status, await res.text());
      }

      return res.json();
    },
    start: (id: string) =>
      fetchAPI<Run>(`/runs/${id}/start`, {
        method: "POST",
      }),
    pause: (id: string) =>
      fetchAPI<Run>(`/runs/${id}/pause`, {
        method: "POST",
      }),
    resume: (id: string) =>
      fetchAPI<Run>(`/runs/${id}/resume`, {
        method: "POST",
      }),
  },
};
