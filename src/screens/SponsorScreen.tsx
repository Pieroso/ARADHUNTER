import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SponsorScreenProps {
  user: any;
  onLogout: () => void;
}

export default function SponsorScreen({ user, onLogout }: SponsorScreenProps) {
  return (
    <View style={styles.container}>
      <Text>Sponsor Screen</Text>
      <Text>Benvenuto, {user.name}</Text>
      {/* Qui andranno le funzionalità sponsor */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});