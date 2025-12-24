import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './config';

export interface Objective {
  id: string;
  name: string;
  description: string;
  points: number;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  location: string;
  sponsor: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string;
  arImage?: string;
  markerImage?: string;
  active: boolean;
  category?: string;
  specialPrize?: {
    enabled: boolean;
    name: string;
    description: string;
    bonusPoints: number;
    icon: string;
    animation: 'bounce' | 'spin' | 'pulse';
  };
  arConfig?: {
    maxDistance: number;
    headingTolerance: number;
    pitchTolerance: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ObjectivesService {
  static async getAllObjectives(): Promise<Objective[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'objectives'), where('active', '==', true))
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Objective));
    } catch (error) {
      console.error('Error getting objectives:', error);
      throw new Error('Errore nel caricamento obiettivi');
    }
  }

  static async getObjectiveById(id: string): Promise<Objective | null> {
    try {
      const docSnap = await getDoc(doc(db, 'objectives', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Objective;
      }
      return null;
    } catch (error) {
      console.error('Error getting objective:', error);
      throw new Error('Errore nel caricamento obiettivo');
    }
  }

  static async getNearbyObjectives(
    userLat: number, 
    userLng: number, 
    radiusKm: number = 5
  ): Promise<Objective[]> {
    try {
      // Firebase non supporta query geospaziali native, 
      // quindi carichiamo tutti e filtriamo lato client
      const allObjectives = await this.getAllObjectives();
      
      return allObjectives.filter(obj => {
        const distance = this.calculateDistance(
          userLat, userLng, 
          obj.coordinates.lat, obj.coordinates.lng
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error getting nearby objectives:', error);
      throw new Error('Errore nel caricamento obiettivi vicini');
    }
  }

  static async scanObjective(objectiveId: string, userId: string): Promise<{
    pointsEarned: number;
    newLevel: number;
    totalPoints: number;
    totalCaptured: number;
  }> {
    try {
      const objectiveDoc = await getDoc(doc(db, 'objectives', objectiveId));
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!objectiveDoc.exists() || !userDoc.exists()) {
        throw new Error('Obiettivo o utente non trovato');
      }

      const objective = objectiveDoc.data() as Objective;
      const userData = userDoc.data();

      // Calcola punti totali (obiettivo + eventuale premio speciale)
      let totalPointsEarned = objective.points;
      if (objective.specialPrize?.enabled) {
        totalPointsEarned += objective.specialPrize.bonusPoints;
      }

      // Aggiorna dati utente
      const newPoints = (userData.points || 0) + totalPointsEarned;
      const newTotalCaptured = (userData.totalCaptured || 0) + 1;
      const newLevel = Math.floor(newPoints / 1000) + 1;

      await updateDoc(doc(db, 'users', userId), {
        points: newPoints,
        totalCaptured: newTotalCaptured,
        level: newLevel,
        updatedAt: new Date()
      });

      // Registra la scansione (opzionale, per analytics)
      await this.recordObjectiveScan(userId, objectiveId, totalPointsEarned);

      return {
        pointsEarned: totalPointsEarned,
        newLevel,
        totalPoints: newPoints,
        totalCaptured: newTotalCaptured
      };
    } catch (error: any) {
      console.error('Error scanning objective:', error);
      throw new Error(error.message || 'Errore nella scansione obiettivo');
    }
  }

  private static async recordObjectiveScan(
    userId: string, 
    objectiveId: string, 
    pointsEarned: number
  ): Promise<void> {
    try {
      const scanData = {
        userId,
        objectiveId,
        pointsEarned,
        scannedAt: new Date()
      };
      
      await setDoc(doc(collection(db, 'objectiveScans')), scanData);
    } catch (error) {
      console.error('Error recording scan:', error);
      // Non blocchiamo l'operazione principale per un errore di analytics
    }
  }

  private static calculateDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}