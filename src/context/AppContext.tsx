import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ObjectivesService, Objective } from '../services/firebase/objectivesService';
import { VouchersService, Voucher } from '../services/firebase/vouchersService';
import { UsersService } from '../services/firebase/usersService';
import { useAuth } from './AuthContext';

interface AppContextType {
  objectives: Objective[];
  vouchers: Voucher[];
  userVouchers: any[];
  leaderboard: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
  scanObjective: (objectiveId: string) => Promise<void>;
  redeemVoucher: (voucherId: string) => Promise<void>;
  useVoucher: (voucherId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, location } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, location]);

  const refreshData = async () => {
    if (!user || !location) return;

    try {
      setLoading(true);
      
      const [
        objectivesData,
        vouchersData,
        userVouchersData,
        leaderboardData
      ] = await Promise.all([
        ObjectivesService.getNearbyObjectives(location.lat, location.lng),
        VouchersService.getAllVouchers(),
        VouchersService.getUserVouchers(user.id),
        UsersService.getLeaderboard()
      ]);

      setObjectives(objectivesData);
      setVouchers(vouchersData);
      setUserVouchers(userVouchersData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanObjective = async (objectiveId: string) => {
    if (!user) throw new Error('User not logged in');
    
    try {
      const result = await ObjectivesService.scanObjective(objectiveId, user.id);
      await refreshData(); // Refresh all data
      return result;
    } catch (error) {
      throw error;
    }
  };

  const redeemVoucher = async (voucherId: string) => {
    if (!user) throw new Error('User not logged in');
    
    try {
      const result = await VouchersService.redeemVoucher(voucherId, user.id);
      await refreshData(); // Refresh all data
      return result;
    } catch (error) {
      throw error;
    }
  };

  const useVoucher = async (voucherId: string) => {
    try {
      await VouchersService.useVoucher(voucherId);
      await refreshData(); // Refresh all data
    } catch (error) {
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      objectives,
      vouchers,
      userVouchers,
      leaderboard,
      loading,
      refreshData,
      scanObjective,
      redeemVoucher,
      useVoucher
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};