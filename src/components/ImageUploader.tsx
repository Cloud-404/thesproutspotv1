"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Product Image",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Image size must be under 5MB (selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[#26291F] block">
          {label} *
        </label>
        {value && (
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Image attached
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        /* Preview state with Replace and Remove options */
        <div className="relative rounded-2xl border border-[#F8EBD2] bg-[#FBF8F0] p-3 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
            <Image
              src={value}
              alt="Product Preview"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-xs font-bold text-[#263719] truncate">
              {value.startsWith("http") ? "Uploaded to Supabase Storage" : value}
            </p>
            <p className="text-[10px] text-[#74776D]">
              Format verified • Ready for menu display
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-[11px] font-bold flex items-center gap-1"
              >
                {uploading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone state */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#34451F] bg-[#DCE8C9]/30"
              : "border-[#F8EBD2] hover:border-[#34451F] bg-[#FBF8F0]"
          }`}
        >
          {uploading ? (
            <div className="space-y-2 py-3">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-[#34451F] border-t-transparent rounded-full" />
              <p className="text-xs font-bold text-[#263719]">
                Uploading to Supabase Storage...
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-10 h-10 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#263719]">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-[#74776D] mt-0.5">
                  JPG, PNG, or WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

