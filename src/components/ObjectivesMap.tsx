import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';

interface Objective {
  id: string;
  title: string;
  sponsorName: string;
  latitude: number;
  longitude: number;
  points: number;
}

interface ObjectivesMapProps {
  objectives: Objective[];
}

export default function ObjectivesMap({ objectives }: ObjectivesMapProps) {
  const { location } = useAuth();
  const [region, setRegion] = useState<Region | undefined>();

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location]);

  if (!location || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6d28d9" />
        <Text style={styles.loadingText}>Caricamento posizione...</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
      showsCompass
    >
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
          pinColor="#6d28d9"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});