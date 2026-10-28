"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
  resourceType?: "image" | "video";
  multiple?: boolean;
}

export interface CloudinaryUploaderHandle {
  uploadPendingFiles: () => Promise<string[]>;
}

const CloudinaryUploader = forwardRef<CloudinaryUploaderHandle, Props>(
  ({ urls, onChange, resourceType = "image", multiple = true }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Create blob URLs for preview
    function createBlobUrls(files: File[]): string[] {
      return files.map((file) => URL.createObjectURL(file));
    }

    // Handle file selection - preview only, no upload yet
    function handleFiles(files: FileList | null) {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const newBlobUrls = createBlobUrls(fileArray);

      setPendingFiles((prev) => (multiple ? [...prev, ...fileArray] : fileArray));
      setPreviewUrls((prev) => (multiple ? [...prev, ...newBlobUrls] : newBlobUrls));

      if (inputRef.current) inputRef.current.value = "";
    }

    // Upload pending files to Cloudinary
    async function uploadPendingFiles(): Promise<string[]> {
      if (pendingFiles.length === 0) return urls;

      setUploading(true);
      try {
        const sigRes = await fetch("/api/upload", { method: "POST" });
        if (!sigRes.ok) throw new Error("Could not get upload signature");
        const sig = await sigRes.json();

        const uploaded: string[] = [];
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", sig.apiKey);
          formData.append("timestamp", String(sig.timestamp));
          formData.append("signature", sig.signature);
          formData.append("folder", sig.folder);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
            { method: "POST", body: formData }
          );
          const data = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(data.error?.message || "Upload failed");
          uploaded.push(data.secure_url);
        }

        // Cleanup blob URLs
        previewUrls.forEach((url) => URL.revokeObjectURL(url));

        // Update with actual URLs
        const uploadedUrls = multiple ? [...urls, ...uploaded] : uploaded;
        onChange(uploadedUrls);
        setPendingFiles([]);
        setPreviewUrls([]);
        toast.success("Upload complete");
        return uploadedUrls;
      } finally {
        setUploading(false);
      }
    }

    useImperativeHandle(ref, () => ({
      uploadPendingFiles,
    }));

    function removeAt(i: number, isPending: boolean) {
      if (isPending) {
        setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
        const urlToRemove = previewUrls[i];
        if (urlToRemove) URL.revokeObjectURL(urlToRemove);
        setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
      } else {
        onChange(urls.filter((_, idx) => idx !== i));
      }
    }

    const allItems = [
      ...previewUrls.map((url, i) => ({ url, i, isPending: true })),
      ...urls.map((url, i) => ({ url, i, isPending: false })),
    ];

    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {allItems.map(({ url, i, isPending }) => (
            <div key={url + i} className={`relative w-16 h-16 border ${isPending ? "border-beige-dim opacity-70" : "border-line"}`}>
              {resourceType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={url} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => removeAt(i, isPending)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-burgundy text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
              {isPending && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-burgundy text-white px-1 rounded">
                  pending
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-beige-dim hover:text-beige"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          Select {resourceType === "image" ? "Image(s)" : "Video(s)"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={resourceType === "image" ? "image/*" : "video/*"}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }
);

CloudinaryUploader.displayName = "CloudinaryUploader";

export default CloudinaryUploader;
