import { Upload } from "lucide-react";

export default function ImageUpload({
  imagePreview,
  fileInputRef,
  handleImageUpload,
}: any) {
  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-64 rounded-lg overflow-hidden bg-white border cursor-pointer flex items-center justify-center"
      >
        {imagePreview ? (
          <img src={imagePreview} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400 text-sm">
            <Upload size={20} />
            Upload Screen Image
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}