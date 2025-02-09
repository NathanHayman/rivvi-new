import { useCallback, useEffect, useState } from "react";

import { api } from "../lib/api";
import { Run, RunRecord } from "../types/campaign";

export function useRun(runId: string) {
  const [run, setRun] = useState<Run | null>(null);
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch run and records
  const fetchRun = useCallback(async () => {
    try {
      setLoading(true);
      const [runData, recordsData] = await Promise.all([
        api.runs.get(runId),
        api.runs.getRecords(runId),
      ]);
      setRun(runData);
      setRecords(recordsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch run"));
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Upload CSV
  const uploadCSV = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        await api.runs.uploadCSV(runId, file);
        await fetchRun(); // Refresh data
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to upload CSV")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [runId, fetchRun]
  );

  // Start run
  const startRun = useCallback(async () => {
    try {
      setLoading(true);
      const updatedRun = await api.runs.start(runId);
      setRun(updatedRun);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to start run"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Pause run
  const pauseRun = useCallback(async () => {
    try {
      setLoading(true);
      const updatedRun = await api.runs.pause(runId);
      setRun(updatedRun);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to pause run"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Resume run
  const resumeRun = useCallback(async () => {
    try {
      setLoading(true);
      const updatedRun = await api.runs.resume(runId);
      setRun(updatedRun);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to resume run"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Poll for updates when run is in progress
  useEffect(() => {
    if (run?.status === "in_progress") {
      const interval = setInterval(fetchRun, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [run?.status, fetchRun]);

  // Initial fetch
  useEffect(() => {
    fetchRun();
  }, [fetchRun]);

  return {
    run,
    records,
    loading,
    error,
    uploadCSV,
    startRun,
    pauseRun,
    resumeRun,
    refreshRun: fetchRun,
  };
}
