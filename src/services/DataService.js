import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './firebase';

export class DataService {
  // Objectives
  static async getObjectives() {
    const querySnapshot = await getDocs(collection(db, 'objectives'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getObjectiveById(id) {
    const docRef = doc(db, 'objectives', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Objective not found');
    }
  }

  // Vouchers
  static async getVouchers() {
    const querySnapshot = await getDocs(collection(db, 'vouchers'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async redeemVoucher(userId, voucherId) {
    // 1. Ottieni il voucher
    const voucherDoc = await getDoc(doc(db, 'vouchers', voucherId));
    if (!voucherDoc.exists()) {
      throw new Error('Voucher not found');
    }
    const voucher = voucherDoc.data();

    // 2. Ottieni l'utente
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const user = userDoc.data();

    // 3. Verifica punti sufficienti
    if (user.points < voucher.pointsCost) {
      throw new Error('Insufficient points');
    }

    // 4. Verifica disponibilità
    if (voucher.available <= 0) {
      throw new Error('Voucher out of stock');
    }

    // 5. Crea userVoucher
    const userVoucher = {
      userId,
      originalVoucherId: voucherId,
      code: voucher.code,
      description: voucher.description,
      value: voucher.value,
      pointsCost: voucher.pointsCost,
      sponsor: voucher.sponsor,
      image: voucher.image,
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + voucher.expiryDays * 24 * 60 * 60 * 1000),
      used: false,
      status: 'active'
    };

    const userVoucherRef = doc(collection(db, 'userVouchers'));
    await setDoc(userVoucherRef, userVoucher);

    // 6. Aggiorna utente: sottrai punti e aumenta vouchersGenerated
    await updateDoc(doc(db, 'users', userId), {
      points: user.points - voucher.pointsCost,
      vouchersGenerated: user.vouchersGenerated + 1
    });

    // 7. Aggiorna voucher: diminuisci disponibilità
    await updateDoc(doc(db, 'vouchers', voucherId), {
      available: voucher.available - 1
    });

    return { id: userVoucherRef.id, ...userVoucher };
  }

  // User Vouchers
  static async getUserVouchers(userId) {
    const q = query(collection(db, 'userVouchers'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async useVoucher(userVoucherId) {
    await updateDoc(doc(db, 'userVouchers', userVoucherId), {
      used: true,
      status: 'presented',
      presentedAt: new Date()
    });
  }

  // Sponsors
  static async getSponsors() {
    const querySnapshot = await getDocs(collection(db, 'sponsors'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Users
  static async getUsers() {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateUser(userId, data) {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date()
    });
  }

  // Leaderboard
  static async getLeaderboard(limitCount = 50) {
    const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}