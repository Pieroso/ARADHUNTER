import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdminScreenProps {
  user: any;
  onLogout: () => void;
}

export default function AdminScreen({ user, onLogout }: AdminScreenProps) {
  return (
    <View style={styles.container}>
      <Text>Admin Screen</Text>
      <Text>Benvenuto, {user.name}</Text>
      {/* Qui andranno le funzionalità admin */}
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