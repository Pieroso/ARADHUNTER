import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';

// CONFIG COMPLETA di Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "ar-ad-hunter.firebaseapp.com",
  projectId: "ar-ad-hunter",
  storageBucket: "ar-ad-hunter.appspot.com",
  messagingSenderId: "5669791063",
  appId: "1:5669791063:android:8a4021015f0002bb4d0a12"
};

// Inizializza Firebase UNA VOLTA SOLA
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
  console.log("Firebase inizializzato per notifiche");
}

export class NotificationsService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notifications permissions:', error);
      return false;
    }
  }

  static async scheduleLocalNotification(title: string, body: string, data: any = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async setupPushNotifications(userId: string) {
    try {
      console.log("1. Controllo permessi...");
      
      // Richiedi permessi
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log("Permessi notifiche non concessi");
        return null;
      }
      
      console.log("2. Ottenendo token...");
      
      // Aspetta 1 secondo per sicurezza
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Configura handler per notifiche in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // 🔴 SOSTITUISCI QUESTA RIGA:
      // const token = await Notifications.getExpoPushTokenAsync({
      //   projectId: 'ar-ad-hunter',
      // });
      
      // ✅ CON QUESTA (token NATIVO Firebase):
      const token = await Notifications.getDevicePushTokenAsync();
      
      console.log('3. Token nativo ottenuto:', token.data);
      
      // Salva il token.data (stringa) sul TUO server
      // es: await api.saveUserPushToken(userId, token.data);
      
      return token.data;
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      return null;
    }
  }
}

