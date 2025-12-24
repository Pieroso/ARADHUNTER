import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Alert.alert('Successo', 'Login effettuato!');
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      setMode('verify');
      Alert.alert('Successo', 'Controlla la tua email per il codice di verifica!');
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail: string, testPassword: string = 'password') => {
    setEmail(testEmail);
    setPassword(testPassword);
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 AR Ad Hunter</Text>
        <Text style={styles.subtitle}>Caccia le pubblicità, vinci premi reali!</Text>
      </View>

      {mode !== 'verify' && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.activeTab]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'register' && styles.activeTab]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>
              Registrati
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        {mode === 'login' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Accesso...' : 'Accedi'}
              </Text>
            </TouchableOpacity>

            <View style={styles.quickLogin}>
              <Text style={styles.quickLoginTitle}>Accesso Rapido:</Text>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin('player@test.com')}
              >
                <Text style={styles.quickButtonText}>👤 Player Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin('admin@test.com')}
              >
                <Text style={styles.quickButtonText}>👑 Admin Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin('mcdonald@sponsor.com')}
              >
                <Text style={styles.quickButtonText}>🍔 Sponsor Demo</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode === 'register' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 caratteri)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrazione...' : 'Registrati'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'verify' && (
          <>
            <Text style={styles.verifyTitle}>Verifica Email</Text>
            <Text style={styles.verifyText}>
              Abbiamo inviato un link di verifica a{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            <Text style={styles.verifyNote}>
              Clicca sul link nella tua email e poi torna qui per effettuare il login.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setMode('login')}
            >
              <Text style={styles.buttonText}>Vai al Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#6d28d9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6d28d9',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#6d28d9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickLogin: {
    marginTop: 20,
  },
  quickLoginTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#6b7280',
  },
  quickButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verifyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2937',
  },
  verifyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: '#6d28d9',
  },
  verifyNote: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});