import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export class AuthService {
  static async register(userData) {
    try {
      // Crea l'utente con Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      const user = userCredential.user;

      // Crea il documento utente in Firestore
      const userDoc = {
        name: userData.name,
        email: userData.email,
        points: 2500, // Punti bonus iniziali
        level: 1,
        totalCaptured: 0,
        vouchersGenerated: 0,
        role: 'player',
        banned: false,
        myReferralCode: 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        totalInvites: 0,
        emailVerified: false,
        sponsorName: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      // Aggiorna il profilo in Authentication con il nome
      await updateProfile(user, { displayName: userData.name });

      return { ...userDoc, id: user.uid };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Recupera i dati aggiuntivi da Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      return { id: user.uid, ...userDoc.data() };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          return { id: user.uid, ...userDoc.data() };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Listener per cambiamenti di autenticazione
  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
}