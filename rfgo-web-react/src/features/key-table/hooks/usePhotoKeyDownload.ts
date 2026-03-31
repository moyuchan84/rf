import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ExcelRestoreService } from '../services/ExcelRestoreService';
import { type PhotoKey } from '../../master-data/types';

export const usePhotoKeyDownload = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

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

  const downloadBulk = async (keys: PhotoKey[]) => {
    if (keys.length === 0) return;
    
    setIsBulkDownloading(true);
    const toastId = toast.loading(`Preparing ZIP for ${keys.length} files...`);

    try {
      await ExcelRestoreService.downloadBulkFromApi(keys.map(k => k.id));
      toast.success('Bulk download complete!', { id: toastId });
    } catch (err) {
      console.error('Bulk download failed:', err);
      toast.error('Bulk download failed. Please try again.', { id: toastId });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return {
    downloadBinary,
    downloadBulk,
    isDownloading: (id: number) => downloadingId === id,
    isBulkDownloading
  };
};
