"use client";
import { useState, useCallback } from "react";

interface UploadState {
  progress: number;
  uploading: boolean;
  error: string | null;
}

interface UploadOptions {
  title: string;
  subject: string;
  semester?: string;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    uploading: false,
    error: null,
  });

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<boolean> => {
    setState({ progress: 5, uploading: true, error: null });

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/notes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { data: presign, error } = await presignRes.json();
      if (!presignRes.ok) throw new Error(error ?? "Failed to get upload URL");
      setState((s) => ({ ...s, progress: 30 }));

      // 2. Upload to S3
      const s3Res = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) throw new Error("Storage upload failed");
      setState((s) => ({ ...s, progress: 70 }));

      // 3. Save to DB
      const saveRes = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...options,
          fileName: file.name,
          fileType: file.type,
          fileKey: presign.fileKey,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save note metadata");
      setState({ progress: 100, uploading: false, error: null });
      return true;
    } catch (err) {
      setState({
        progress: 0,
        uploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ progress: 0, uploading: false, error: null });
  }, []);

  return { ...state, upload, reset };
}
