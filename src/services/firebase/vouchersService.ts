import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  setDoc,
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

export interface Voucher {
  id: string;
  code: string;
  description: string;
  value: number;
  pointsCost: number;
  expiryDays: number;
  image: string;
  sponsor: string;
  available: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserVoucher {
  id: string;
  userId: string;
  originalVoucherId: string;
  code: string;
  description: string;
  value: number;
  pointsCost: number;
  sponsor: string;
  image: string;
  redeemedAt: Date;
  expiresAt: Date;
  used: boolean;
  status: 'active' | 'presented' | 'verified';
  verifiedAt?: Date;
  verifiedBy?: string;
  presentedAt?: Date;
}

export class VouchersService {
  static async getAllVouchers(): Promise<Voucher[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'vouchers'), where('available', '>', 0))
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Voucher));
    } catch (error) {
      console.error('Error getting vouchers:', error);
      throw new Error('Errore nel caricamento voucher');
    }
  }

  static async redeemVoucher(voucherId: string, userId: string): Promise<UserVoucher> {
    try {
      // 1. Verifica voucher disponibile
      const voucherDoc = await getDoc(doc(db, 'vouchers', voucherId));
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!voucherDoc.exists() || !userDoc.exists()) {
        throw new Error('Voucher o utente non trovato');
      }

      const voucher = voucherDoc.data() as Voucher;
      const userData = userDoc.data();

      // 2. Verifica punti sufficienti
      if (userData.points < voucher.pointsCost) {
        throw new Error(`Punti insufficienti! Ti servono ${voucher.pointsCost} punti`);
      }

      // 3. Verifica disponibilità
      if (voucher.available <= 0) {
        throw new Error('Voucher esaurito');
      }

      // 4. Crea user voucher
      const userVoucher: Omit<UserVoucher, 'id'> = {
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

      // 5. Aggiorna utente e voucher
      await updateDoc(doc(db, 'users', userId), {
        points: userData.points - voucher.pointsCost,
        vouchersGenerated: (userData.vouchersGenerated || 0) + 1,
        updatedAt: new Date()
      });

      await updateDoc(doc(db, 'vouchers', voucherId), {
        available: voucher.available - 1,
        updatedAt: new Date()
      });

      return { id: userVoucherRef.id, ...userVoucher };
    } catch (error: any) {
      console.error('Error redeeming voucher:', error);
      throw new Error(error.message || 'Errore nel riscatto voucher');
    }
  }

  static async getUserVouchers(userId: string): Promise<UserVoucher[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'userVouchers'), 
          where('userId', '==', userId),
          orderBy('redeemedAt', 'desc')
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserVoucher));
    } catch (error) {
      console.error('Error getting user vouchers:', error);
      throw new Error('Errore nel caricamento voucher utente');
    }
  }

  static async useVoucher(userVoucherId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'userVouchers', userVoucherId), {
        used: true,
        status: 'presented',
        presentedAt: new Date()
      });
    } catch (error: any) {
      console.error('Error using voucher:', error);
      throw new Error('Errore nell\'utilizzo voucher');
    }
  }

  static async verifyVoucher(voucherCode: string, sponsorName: string): Promise<void> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'userVouchers'), 
          where('code', '==', voucherCode.toUpperCase()),
          where('status', '==', 'presented'),
          where('sponsor', '==', sponsorName)
        )
      );

      if (querySnapshot.empty) {
        throw new Error('Voucher non trovato o già verificato');
      }

      const voucherDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'userVouchers', voucherDoc.id), {
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: sponsorName
      });

      // Aggiorna revenue sponsor (opzionale)
      await this.updateSponsorRevenue(sponsorName, voucherDoc.data().value);
    } catch (error: any) {
      console.error('Error verifying voucher:', error);
      throw new Error(error.message || 'Errore nella verifica voucher');
    }
  }

  private static async updateSponsorRevenue(sponsorName: string, amount: number): Promise<void> {
    try {
      const sponsorsSnapshot = await getDocs(
        query(collection(db, 'sponsors'), where('name', '==', sponsorName))
      );

      if (!sponsorsSnapshot.empty) {
        const sponsorDoc = sponsorsSnapshot.docs[0];
        const sponsorData = sponsorDoc.data();
        
        await updateDoc(doc(db, 'sponsors', sponsorDoc.id), {
          revenue: (sponsorData.revenue || 0) + amount,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating sponsor revenue:', error);
    }
  }
}