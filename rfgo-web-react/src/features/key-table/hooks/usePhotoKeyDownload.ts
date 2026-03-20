import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ExcelRestoreService } from '../services/ExcelRestoreService';
import { type PhotoKey } from '../../master-data/types';

export const usePhotoKeyDownload = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadBinary = async (key: PhotoKey) => {
    setDownloadingId(key.id);
    const toastId = toast.loading(`Downloading ${key.tableName}...`);
    
    try {
      await ExcelRestoreService.downloadBinaryFromApi(key.id, key.tableName, key.revNo);
      toast.success('Download complete!', { id: toastId });
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed. Please try again.', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    downloadBinary,
    isDownloading: (id: number) => downloadingId === id,
  };
};
