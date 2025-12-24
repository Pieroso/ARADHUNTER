import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, UserData } from '../services/firebase/authService';
import { LocationService } from '../services/firebase/locationService';

interface AuthContextType {
  user: UserData | null;
  location: { lat: number; lng: number } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check existing session
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // Get initial location
      await updateLocation();
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await AuthService.login(email, password);
      setUser(userData);
      await updateLocation();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, referralCode?: string) => {
    try {
      setLoading(true);
      const userData = await AuthService.register(email, password, name, referralCode);
      setUser(userData);
      await updateLocation();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
      setLocation(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
      
      // Update user location in database if logged in
      if (user) {
        await AuthService.updateUserLocation(user.id, currentLocation.lat, currentLocation.lng);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      location,
      loading,
      login,
      register,
      logout,
      updateLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};