// src/components/lab/ResourcePhotoUploader.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  recursoId: number;
  currentPhotos: { id: string; url: string; es_principal: boolean }[];
}

export default function ResourcePhotoUploader({ recursoId, currentPhotos }: Props) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${recursoId}-${Date.now()}.${fileExt}`;
    const filePath = `recursos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos-recursos") 
      .upload(filePath, file);

    if (uploadError) {
      alert("Error al subir foto: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("fotos-recursos")
      .getPublicUrl(filePath);

    const { error } = await supabase
      .from("foto_recurso")
      .insert({
        recurso_id: recursoId,
        url: publicUrl,
        es_principal: currentPhotos.length === 0,
      });

    if (error) alert("Error al guardar foto: " + error.message);
    else queryClient.invalidateQueries({ queryKey: ["recursos_con_fotos"] });

    setUploading(false);
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("foto_recurso").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["recursos_con_fotos"] });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {currentPhotos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img src={photo.url} alt="recurso" className="w-full h-48 object-cover rounded-lg" />
            {photo.es_principal && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                Principal
              </span>
            )}
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Card className="border-dashed border-2 p-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
          disabled={uploading}
          className="hidden"
          id={`upload-${recursoId}`}
        />
        <label htmlFor={`upload-${recursoId}`} className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? "Subiendo..." : "Haz clic o arrastra una foto"}
          </p>
        </label>
      </Card>
    </div>
  );
}