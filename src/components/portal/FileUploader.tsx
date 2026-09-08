import { useRef, useState } from "react";
import { Upload, X, FileText, Image, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

interface FileUploaderProps {
  folder?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onUpload: (files: UploadResult[]) => void;
  onError?: (error: string) => void;
  className?: string;
  label?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploader({
  folder = "general",
  accept = "image/*,application/pdf,video/mp4,video/webm",
  multiple = false,
  maxFiles = 5,
  maxFileSize = 50 * 1024 * 1024,
  onUpload,
  onError,
  className,
  label = "Upload files",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, maxFiles);

    const oversized = files.find((f) => f.size > maxFileSize);
    if (oversized) {
      onError?.(`File "${oversized.name}" is ${formatSize(oversized.size)}. Maximum allowed is ${formatSize(maxFileSize)}.`);
      return;
    }

    setUploading(true);
    try {
      const results: UploadResult[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env["VITE_API_BASE_URL"] ?? "/api"}/uploads?folder=${folder}`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Upload failed");
        results.push(json.data);
      }

      onUpload(results);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outlineNavy"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploading ? "Uploading..." : label}
      </Button>
      <span className="ml-2 text-xs text-muted-foreground">Max {formatSize(maxFileSize)}</span>
    </div>
  );
}

export function FilePreview({
  url,
  name,
  type,
  size,
  onRemove,
}: {
  url: string;
  name: string;
  type: string;
  size?: number;
  onRemove?: () => void;
}) {
  const Icon = type.startsWith("image/") ? Image : type.startsWith("video/") ? Video : FileText;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      {type.startsWith("image/") ? (
        <img src={url} alt={name} className="size-10 shrink-0 rounded object-cover" />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {size ? <p className="text-xs text-muted-foreground">{formatSize(size)}</p> : null}
      </div>
      {onRemove ? (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
