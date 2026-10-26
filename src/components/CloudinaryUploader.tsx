import React, { useState } from 'react';
import {
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  CloudUpload,
} from 'lucide-react';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  uploadRemoteUrlToCloudinary,
  uploadToCloudinary,
  validateImageFile,
} from '../lib/cloudinary';

interface CloudinaryUploaderProps {
  currentUrl: string;
  currentPublicId?: string;
  label?: string;
  onUploaded: (result: { url: string; publicId: string; width: number; height: number }) => void;
  onRemove?: () => void;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  currentUrl,
  currentPublicId,
  label = 'Product / Banner Image',
  onUploaded,
  onRemove,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importingRemote, setImportingRemote] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setUploadSuccess(false);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const executeUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(5);
    setErrorMsg(null);
    setUploadSuccess(false);

    try {
      const res = await uploadToCloudinary(selectedFile, (pct) => setProgress(pct));
      onUploaded({
        url: res.secure_url,
        publicId: res.public_id,
        width: res.width,
        height: res.height,
      });
      setUploadSuccess(true);
      setSelectedFile(null);
      setLocalPreview(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Cloudinary upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleImportCurrentRemoteUrl = async () => {
    if (!currentUrl || !currentUrl.startsWith('http')) return;
    setImportingRemote(true);
    setErrorMsg(null);
    setUploadSuccess(false);
    try {
      const res = await uploadRemoteUrlToCloudinary(currentUrl);
      onUploaded({
        url: res.secure_url,
        publicId: res.public_id,
        width: res.width,
        height: res.height,
      });
      setUploadSuccess(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Cloudinary remote URL import failed.'
      );
    } finally {
      setImportingRemote(false);
    }
  };

  const displayImage = localPreview || currentUrl;
  const isRemoteNonCloudinary =
    Boolean(currentUrl) &&
    currentUrl.startsWith('http') &&
    !currentUrl.includes('res.cloudinary.com');

  return (
    <div className="border border-[#D6D3D1] bg-[#FAF8F5] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#141413]">
            {label}
          </p>
          <p className="text-[11px] text-[#78716C] font-mono-tabular">
            Cloud: {CLOUDINARY_CLOUD_NAME} · Preset: &quot;{CLOUDINARY_UPLOAD_PRESET}&quot;
          </p>
        </div>
        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Preview Box */}
      {displayImage && (
        <div className="relative w-full h-44 bg-[#F3EFEA] border border-[#E5E0D8] overflow-hidden flex items-center justify-center">
          <img
            src={displayImage}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain"
          />
          {localPreview && (
            <span className="absolute bottom-2 left-2 bg-[#141413]/85 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider">
              Staged Preview — Click Upload to Save to Cloudinary
            </span>
          )}
        </div>
      )}

      {currentPublicId && !localPreview && (
        <p className="text-[11px] font-mono-tabular text-[#57534E] truncate">
          Cloudinary Public ID: {currentPublicId}
        </p>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-[#141413] text-xs font-semibold uppercase tracking-wider text-[#141413] hover:bg-[#F3EFEA] transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>Select Image File</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {selectedFile && (
          <button
            type="button"
            disabled={uploading}
            onClick={executeUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#734f2c] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
            <span>
              {uploading ? `Uploading (${progress}%)` : 'Upload to Cloudinary'}
            </span>
          </button>
        )}

        {!selectedFile && isRemoteNonCloudinary && (
          <button
            type="button"
            disabled={importingRemote}
            onClick={handleImportCurrentRemoteUrl}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] disabled:opacity-50 transition-colors"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${importingRemote ? 'animate-bounce' : ''}`} />
            <span>
              {importingRemote
                ? 'Importing to Cloudinary...'
                : 'Import Reference URL to Cloudinary'}
            </span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full h-1.5 bg-[#E5E0D8] overflow-hidden">
          <div
            className="h-full bg-[#8C6239] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Upload Success */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Saved to Cloudinary ({CLOUDINARY_CLOUD_NAME}) and attached to form.</span>
        </div>
      )}

      {/* Error & Retry */}
      {errorMsg && (
        <div className="space-y-2 text-xs text-amber-900 bg-amber-50 border border-amber-300 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
          {selectedFile && (
            <button
              type="button"
              onClick={executeUpload}
              className="underline font-semibold text-amber-900"
            >
              Retry Cloudinary Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
};
