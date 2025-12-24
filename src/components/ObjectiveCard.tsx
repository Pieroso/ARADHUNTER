import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MapPin, Star, Target } from 'lucide-react-native';
import { Objective } from '../services/firebase/objectivesService';
import { useAuth } from '../context/AuthContext';

interface ObjectiveCardProps {
  objective: Objective;
  onScan: (objective: Objective) => void;
  onViewAR?: (objective: Objective) => void;
}

export default function ObjectiveCard({ objective, onScan, onViewAR }: ObjectiveCardProps) {
  const { location } = useAuth();

  const calculateDistance = () => {
    if (!location) return 'N/A';
    
    const distance = Math.sqrt(
      Math.pow(objective.coordinates.lat - location.lat, 2) +
      Math.pow(objective.coordinates.lng - location.lng, 2)
    ) * 111; // Approximate km
    
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return '#10b981';
      case 'Medio': return '#f59e0b';
      case 'Difficile': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{objective.image}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{objective.name}</Text>
            <Text style={styles.sponsor}>{objective.sponsor}</Text>
          </View>
        </View>
        
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(objective.difficulty) }]}>
          <Text style={styles.difficultyText}>{objective.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.description}>{objective.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.detailText}>{calculateDistance()}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Star size={16} color="#f59e0b" />
          <Text style={styles.detailText}>{objective.points} pts</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Target size={16} color="#8b5cf6" />
          <Text style={styles.detailText}>{objective.location}</Text>
        </View>
      </View>

      {objective.specialPrize?.enabled && (
        <View style={styles.specialPrize}>
          <Text style={styles.specialPrizeText}>
            🎁 {objective.specialPrize.name} (+{objective.specialPrize.bonusPoints} pts)
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => onScan(objective)}
        >
          <Text style={styles.scanButtonText}>📸 Scansiona</Text>
        </TouchableOpacity>
        
        {onViewAR && objective.specialPrize?.enabled && (
          <TouchableOpacity 
            style={styles.arButton}
            onPress={() => onViewAR(objective)}
          >
            <Text style={styles.arButtonText}>👁️ AR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sponsor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  specialPrize: {
    backgroundColor: '#f3e8ff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialPrizeText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  arButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  arButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});