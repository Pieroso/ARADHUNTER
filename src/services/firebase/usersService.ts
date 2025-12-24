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

export class UsersService {
  static async getLeaderboard(limitCount: number = 50): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('banned', '==', false),
          orderBy('points', 'desc'),
          limit(limitCount)
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Errore nel caricamento classifica');
    }
  }

  static async getUserStats(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('Utente non trovato');
      }

      return userDoc.data();
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      throw new Error(error.message || 'Errore nel caricamento statistiche');
    }
  }

  static async updateUserLocation(userId: string, lat: number, lng: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        location: { lat, lng },
        locationUpdatedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error('Error updating user location:', error);
      throw new Error('Errore aggiornamento posizione');
    }
  }
}