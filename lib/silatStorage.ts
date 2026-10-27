import { supabaseAnonClient as supabase } from './supabaseClient';

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Upload gambar dokumen silat (Pas Foto atau Kartu Keluarga) ke Supabase Storage.
 * Bucket default: 'silat-documents'
 */
export async function uploadSilatDocument(
  file: File,
  folder: 'foto' | 'kk',
  prefixName = 'doc'
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanPrefix = prefixName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `${folder}/${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('silat-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error:', uploadError);
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('silat-documents')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Gagal mengunggah berkas gambar.' };
  }
}
