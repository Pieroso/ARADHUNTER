import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export class StorageService {
  static async uploadImage(uri: string, path: string): Promise<string> {
    try {
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(storage, path);

      // Upload file
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Errore nel caricamento immagine');
    }
  }

  static async uploadARImage(file: any, objectiveId: string): Promise<string> {
    const path = `ar-images/${objectiveId}/${Date.now()}-${file.name}`;
    return this.uploadImage(file.uri, path);
  }

  static async uploadMarkerImage(file: any, objectiveId: string): Promise<string> {
    const path = `marker-images/${objectiveId}/${Date.now()}-${file.name}`;
    return this.uploadImage(file.uri, path);
  }
}