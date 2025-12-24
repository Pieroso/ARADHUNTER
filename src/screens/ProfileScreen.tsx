import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { User, Mail, Star, Users, LogOut, Settings, Share2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { userVouchers } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleShareReferral = () => {
    // Qui potresti implementare la condivisione del codice referral
    Alert.alert(
      'Condividi il tuo codice',
      `Condividi il codice ${user?.myReferralCode} con i tuoi amici!`,
      [{ text: 'OK' }]
    );
  };

  const activeVouchers = userVouchers.filter(v => !v.used && new Date(v.expiresAt) > new Date());
  const usedVouchers = userVouchers.filter(v => v.used);
  const expiredVouchers = userVouchers.filter(v => !v.used && new Date(v.expiresAt) < new Date());

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Profilo */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User size={40} color="#6b7280" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Livello {user?.level}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Star size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{user?.points}</Text>
          <Text style={styles.statLabel}>Punti</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={24} color="#8b5cf6" />
          <Text style={styles.statNumber}>{user?.totalInvites || 0}</Text>
          <Text style={styles.statLabel}>Inviti</Text>
        </View>
      </View>

      {/* Referral Program */}
      <View style={styles.referralSection}>
        <Text style={styles.sectionTitle}>🎁 Invita Amici</Text>
        <View style={styles.referralCard}>
          <Text style={styles.referralCode}>{user?.myReferralCode}</Text>
          <Text style={styles.referralDescription}>
            Condividi questo codice con i tuoi amici. Riceverai 250 punti per ogni amico che si registra!
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
            <Share2 size={20} color="white" />
            <Text style={styles.shareButtonText}>Condividi Codice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voucher Summary */}
      <View style={styles.voucherSummary}>
        <Text style={styles.sectionTitle}>📊 Riepilogo Voucher</Text>
        <View style={styles.voucherStats}>
          <View style={styles.voucherStat}>
            <Text style={styles.voucherStatNumber}>{activeVouchers.length}</Text>
            <Text style={styles.voucherStatLabel}>Attivi</Text>
          </View>
          <View style={styles.voucherStat}>
            <Text style={styles.voucherStatNumber}>{usedVouchers.length}</Text>
            <Text style={styles.voucherStatLabel}>Usati</Text>
          </View>
          <View style={styles.voucherStat}>
            <Text style={styles.voucherStatNumber}>{expiredVouchers.length}</Text>
            <Text style={styles.voucherStatLabel}>Scaduti</Text>
          </View>
        </View>
      </View>

      {/* Menu Actions */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Settings size={24} color="#6b7280" />
          <Text style={styles.menuText}>Impostazioni</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Mail size={24} color="#6b7280" />
          <Text style={styles.menuText}>Supporto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={24} color="#ef4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  referralSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  referralCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#8b5cf6',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  referralDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  voucherSummary: {
    margin: 16,
  },
  voucherStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  voucherStat: {
    flex: 1,
    alignItems: 'center',
  },
  voucherStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  voucherStatLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  logoutText: {
    color: '#ef4444',
  },
});