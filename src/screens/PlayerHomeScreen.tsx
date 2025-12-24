import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Home, Target, ShoppingBag, Ticket, Trophy, BarChart, User, Map } from 'lucide-react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import ObjectiveCard from '../components/ObjectiveCard';
import VoucherCard from '../components/VoucherCard';
import LoadingSpinner from '../components/LoadingSpinner';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function PlayerHomeScreen({ navigation }: any) {
  const { user, location, updateLocation } = useAuth();
  const { objectives, vouchers, userVouchers, leaderboard, loading, refreshData, scanObjective, redeemVoucher, useVoucher } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [mapError, setMapError] = useState<string | null>(null);

  // ✅ Effetto per richiedere i permessi di localizzazione
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permesso localizzazione negato');
          setMapError('Permesso localizzazione negato. Attiva la posizione nelle impostazioni.');
        } else {
          console.log('Permesso localizzazione ottenuto');
          // Forza aggiornamento posizione
          if (updateLocation) {
            await updateLocation();
          }
        }
      } catch (error) {
        console.error('Errore richiesta permessi:', error);
        setMapError('Errore nel richiedere i permessi di localizzazione');
      }
    };

    requestLocationPermission();
  }, [updateLocation]);

  // ✅ Funzione onRefresh DEFINITA CORRETTAMENTE all'interno del componente
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshData().then(() => {
      setRefreshing(false);
      setMapError(null); // Resetta l'errore al refresh
    }).catch(() => {
      setRefreshing(false);
    });
  }, [refreshData]);

  useEffect(() => {
    // setupNotifications(); // COMMENTATO TEMPORANEAMENTE
  }, []);

  const handleScanObjective = async (objective: any) => {
    try {
      const result = await scanObjective(objective.id);
      alert(`🎯 Obiettivo Completato! Hai guadagnato ${result.pointsEarned} punti!`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRedeemVoucher = async (voucherId: string) => {
    try {
      await redeemVoucher(voucherId);
      alert('🎫 Voucher Riscattato! Il voucher è stato aggiunto alla tua collezione!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUseVoucher = async (voucherId: string) => {
    try {
      await useVoucher(voucherId);
      alert('✅ Voucher Utilizzato! Mostra il codice allo sponsor per la verifica.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // ✅ Funzione per refresh manuale della mappa
  const refreshMap = async () => {
    setMapError(null);
    console.log('Refresh manuale mappa');
    if (updateLocation) {
      try {
        await updateLocation();
      } catch (error) {
        setMapError('Errore nell\'aggiornare la posizione');
      }
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Caricamento dati..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Ciao, {user?.name}!</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ {user?.points}</Text>
              <Text style={styles.statLabel}>Punti</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>🏆 Lv.{user?.level}</Text>
              <Text style={styles.statLabel}>Livello</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>🎯 {user?.totalCaptured}</Text>
              <Text style={styles.statLabel}>Obiettivi</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <User size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {[
          { id: 'map', label: 'Mappa', icon: Map },
          { id: 'objectives', label: 'Obiettivi', icon: Target },
          { id: 'shop', label: 'Shop', icon: ShoppingBag },
          { id: 'vouchers', label: 'I Miei Voucher', icon: Ticket },
          { id: 'leaderboard', label: 'Classifica', icon: Trophy },
          { id: 'stats', label: 'Statistiche', icon: BarChart },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <tab.icon size={20} color={activeTab === tab.id ? '#8b5cf6' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === 'map' ? (
        <View style={styles.mapContainer}>
          {console.log('MAP TAB - Location:', location)}
          {console.log('MAP TAB - Objectives:', objectives)}
          
          {/* Bottone refresh manuale */}
          <TouchableOpacity
            style={styles.refreshMapButton}
            onPress={refreshMap}
          >
            <Text style={styles.refreshMapText}>🔄</Text>
          </TouchableOpacity>
          
          {mapError ? (
            <View style={styles.mapErrorContainer}>
              <Text style={styles.mapErrorTitle}>⚠️ Mappa non disponibile</Text>
              <Text style={styles.mapErrorText}>{mapError}</Text>
              <TouchableOpacity
                style={styles.mapErrorButton}
                onPress={refreshMap}
              >
                <Text style={styles.mapErrorButtonText}>Riprova</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapFallbackButton}
                onPress={() => setActiveTab('objectives')}
              >
                <Text style={styles.mapFallbackButtonText}>Vedi lista obiettivi</Text>
              </TouchableOpacity>
            </View>
          ) : location ? (
            <>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.lat,
                  longitude: location.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                region={{
                  latitude: location.lat,
                  longitude: location.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                loadingEnabled={true}
                loadingIndicatorColor="#8b5cf6"
                loadingBackgroundColor="#f8fafc"
                onMapReady={() => console.log('Mappa pronta')}
                onMapLoaded={() => console.log('Mappa caricata')}
                onError={(error) => {
                  console.log('Errore mappa:', error.nativeEvent);
                  setMapError('Errore nel caricamento della mappa');
                }}
              >
                {/* Cerchio di 5km intorno all'utente */}
                <Circle
                  center={{
                    latitude: location.lat,
                    longitude: location.lng,
                  }}
                  radius={5000}
                  strokeColor="rgba(139, 92, 246, 0.3)"
                  fillColor="rgba(139, 92, 246, 0.1)"
                />

                {/* Marker per gli obiettivi */}
                {objectives.map((objective) => (
                  <Marker
                    key={objective.id}
                    coordinate={{
                      latitude: objective.latitude,
                      longitude: objective.longitude,
                    }}
                    title={objective.title}
                    description={`${objective.sponsorName} - ${objective.points} punti`}
                    pinColor="#8b5cf6"
                    onCalloutPress={() => {
                      setActiveTab('objectives');
                    }}
                  />
                ))}
              </MapView>

              {/* Floating info card */}
              <View style={styles.mapInfoCard}>
                <Text style={styles.mapInfoTitle}>📍 Obiettivi nelle vicinanze</Text>
                <Text style={styles.mapInfoText}>
                  {objectives.length} obiettivi entro 5km
                </Text>
                <TouchableOpacity 
                  style={styles.mapInfoButton}
                  onPress={() => setActiveTab('objectives')}
                >
                  <Text style={styles.mapInfoButtonText}>Vedi Lista</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.loadingMapContainer}>
              <LoadingSpinner message="Caricamento posizione..." />
              <Text style={styles.mapLoadingText}>
                Attendere il rilevamento della posizione...
              </Text>
              <TouchableOpacity
                style={styles.locationPermissionButton}
                onPress={() => Location.requestForegroundPermissionsAsync()}
              >
                <Text style={styles.locationPermissionButtonText}>Richiedi Permessi</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'objectives' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Obiettivi Vicini</Text>
              {objectives.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nessun obiettivo nelle vicinanze</Text>
                  <Text style={styles.emptyStateSubtext}>Spostati per scoprire nuovi obiettivi!</Text>
                </View>
              ) : (
                objectives.map(objective => (
                  <ObjectiveCard
                    key={objective.id}
                    objective={objective}
                    onScan={handleScanObjective}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'shop' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛍️ Shop Voucher</Text>
              {vouchers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nessun voucher disponibile</Text>
                </View>
              ) : (
                vouchers.map(voucher => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    onRedeem={handleRedeemVoucher}
                    userPoints={user?.points || 0}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'vouchers' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎫 I Miei Voucher</Text>
              {userVouchers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nessun voucher riscattato</Text>
                  <Text style={styles.emptyStateSubtext}>Vai allo Shop per riscattare voucher con i tuoi punti!</Text>
                </View>
              ) : (
                userVouchers.map(voucher => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    onUse={handleUseVoucher}
                    showActions={!voucher.used}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'leaderboard' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Classifica</Text>
              {leaderboard.slice(0, 10).map((player, index) => (
                <View key={player.id} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardPosition}>
                    <Text style={styles.positionText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerStats}>
                      ⭐ {player.points} pts • 🎯 {player.totalCaptured} obiettivi
                    </Text>
                  </View>
                  <View style={styles.leaderboardPoints}>
                    <Text style={styles.pointsText}>{player.points}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'stats' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Le Tue Statistiche</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{user?.totalCaptured || 0}</Text>
                  <Text style={styles.statCardLabel}>Obiettivi Completati</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{user?.vouchersGenerated || 0}</Text>
                  <Text style={styles.statCardLabel}>Voucher Riscattati</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{user?.totalInvites || 0}</Text>
                  <Text style={styles.statCardLabel}>Amici Invitati</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>
                    {user?.points ? Math.floor(user.points / 1000) + 1 : 1}
                  </Text>
                  <Text style={styles.statCardLabel}>Livello Attuale</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ✅ DEFINIZIONE DEGLI STILI AGGIORNATA
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  profileButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  map: {
    width: width,
    height: '100%',
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  mapLoadingText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 15,
  },
  locationPermissionButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  locationPermissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fef2f2',
  },
  mapErrorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  mapErrorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  mapErrorButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  mapErrorButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  mapFallbackButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapFallbackButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  refreshMapButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshMapText: {
    fontSize: 18,
    color: '#8b5cf6',
  },
  mapInfoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  mapInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  mapInfoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  mapInfoButton: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapInfoButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderboardPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    fontWeight: 'bold',
    color: '#6b7280',
  },
  leaderboardInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  playerStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  leaderboardPoints: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
});