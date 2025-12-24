import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './config';

export interface UserData {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  totalCaptured: number;
  vouchersGenerated: number;
  role: 'player' | 'admin' | 'sponsor';
  banned: boolean;
  myReferralCode: string;
  totalInvites: number;
  emailVerified: boolean;
  sponsorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  static async register(
    email: string, 
    password: string, 
    name: string, 
    referralCode?: string
  ): Promise<UserData> {
    try {
      // 1. Crea utente in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      const user = userCredential.user;

      // 2. Genera codice referral
      const myReferralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // 3. Prepara dati utente
      const userData: Omit<UserData, 'id'> = {
        name,
        email,
        points: 2500, // Punti bonus iniziali
        level: 1,
        totalCaptured: 0,
        vouchersGenerated: 0,
        role: 'player',
        banned: false,
        myReferralCode,
        totalInvites: 0,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 4. Salva dati utente in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // 5. Aggiorna profilo Firebase Auth
      await updateProfile(user, { displayName: name });

      // 6. Invia email di verifica
      await sendEmailVerification(user);

      // 7. Gestisci referral code se fornito
      if (referralCode) {
        await this.handleReferral(referralCode, user.uid);
      }

      return { id: user.uid, ...userData };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

static async login(email: string, password: string): Promise<UserData> {
  try {
    console.log('A. Inizio login authService');
    console.log('B. auth:', auth);
    console.log('C. signInWithEmailAndPassword:', signInWithEmailAndPassword);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('D. userCredential ottenuto');
    
    const user = userCredential.user;
    console.log('E. user.uid:', user.uid);

    // Verifica se l'utente è bannato
    console.log('F. Chiamata getDoc...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('G. userDoc.exists:', userDoc.exists());
    
    if (!userDoc.exists()) {
      throw new Error('Utente non trovato');
    }

    const userData = userDoc.data() as Omit<UserData, 'id'>;
    
    if (userData.banned) {
      throw new Error('Account sospeso');
    }

    console.log('H. Login completato con successo');
    return { id: user.uid, ...userData };
  } catch (error: any) {
    console.log('I. Errore catturato:', error);
    console.log('J. Error code:', error.code);
    console.log('K. Error message:', error.message);
    throw new Error(this.getAuthErrorMessage(error.code));
  }
}
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      return { id: user.uid, ...userDoc.data() as Omit<UserData, 'id'> };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserData>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Errore aggiornamento profilo');
    }
  }
  static async updateUserLocation(userId: string, lat: number, lng: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      location: { lat, lng },
      lastLocationUpdate: new Date()
    });
  } catch (error: any) {
    console.error('Error updating user location:', error);
    // Non lanciare errore, la posizione non è critica
  }
}

  private static async handleReferral(referralCode: string, newUserId: string): Promise<void> {
    try {
      // Firebase v9+ sintassi modulare
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('myReferralCode', '==', referralCode.toUpperCase()));
      const usersSnapshot = await getDocs(q);

      if (!usersSnapshot.empty) {
        const referrerDoc = usersSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        const referrerData = referrerDoc.data();

        // Aggiorna chi ha invitato
        await updateDoc(doc(db, 'users', referrerId), {
          totalInvites: (referrerData.totalInvites || 0) + 1,
          points: (referrerData.points || 0) + 250,
          updatedAt: new Date()
        });

        // Bonus per il nuovo utente
        await updateDoc(doc(db, 'users', newUserId), {
          points: 2550 // 2500 + 50 bonus
        });
      }
    } catch (error) {
      console.error('Error handling referral:', error);
    }
  }

  private static getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email già registrata',
      'auth/invalid-email': 'Email non valida',
      'auth/operation-not-allowed': 'Operazione non permessa',
      'auth/weak-password': 'Password troppo debole',
      'auth/user-disabled': 'Account disabilitato',
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/too-many-requests': 'Troppi tentativi, riprova più tardi'
    };
    
    return errorMessages[errorCode] || 'Errore di autenticazione';
  }
}