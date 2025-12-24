import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gift, Star, Calendar } from 'lucide-react-native';

interface VoucherCardProps {
  voucher: any;
  onRedeem?: (voucherId: string) => void;
  onUse?: (voucherId: string) => void;
  userPoints?: number;
  showActions?: boolean;
}

export default function VoucherCard({ 
  voucher, 
  onRedeem, 
  onUse, 
  userPoints = 0, 
  showActions = true 
}: VoucherCardProps) {
  const canAfford = userPoints >= voucher.pointsCost;
  const isUserVoucher = !!voucher.userId;
  const isExpired = new Date(voucher.expiresAt) < new Date();
  const isUsed = voucher.used;

  const getStatusColor = () => {
    if (isUsed) return '#6b7280';
    if (isExpired) return '#ef4444';
    if (voucher.status === 'presented') return '#f59e0b';
    if (voucher.status === 'verified') return '#10b981';
    return '#8b5cf6';
  };

  const getStatusText = () => {
    if (isUsed) return 'Usato';
    if (isExpired) return 'Scaduto';
    if (voucher.status === 'presented') return 'In Verifica';
    if (voucher.status === 'verified') return 'Verificato';
    return 'Attivo';
  };

  return (
    <View style={[styles.card, (isUsed || isExpired) && styles.disabledCard]}>
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{voucher.image}</Text>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.code}>{voucher.code}</Text>
          <Text style={styles.sponsor}>{voucher.sponsor}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <Text style={styles.description}>{voucher.description}</Text>

      <View style={styles.valueSection}>
        <View style={styles.value}>
          <Text style={styles.valueAmount}>€{voucher.value}</Text>
          <Text style={styles.valueLabel}>Valore</Text>
        </View>
        
        {!isUserVoucher && (
          <View style={styles.cost}>
            <Star size={16} color="#f59e0b" />
            <Text style={styles.costText}>{voucher.pointsCost}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        {voucher.redeemedAt && (
          <View style={styles.detailItem}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.detailText}>
              Riscattato: {new Date(voucher.redeemedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            Scade: {new Date(voucher.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {showActions && !isUserVoucher && onRedeem && (
        <TouchableOpacity 
          style={[styles.redeemButton, !canAfford && styles.disabledButton]}
          onPress={() => onRedeem(voucher.id)}
          disabled={!canAfford}
        >
          <Text style={styles.redeemButtonText}>
            {canAfford ? `Riscatta (${voucher.pointsCost} ⭐)` : `Servono ${voucher.pointsCost - userPoints} punti`}
          </Text>
        </TouchableOpacity>
      )}

      {showActions && isUserVoucher && onUse && !isUsed && !isExpired && (
        <TouchableOpacity 
          style={styles.useButton}
          onPress={() => onUse(voucher.id)}
        >
          <Text style={styles.useButtonText}>🎫 Usa Voucher</Text>
        </TouchableOpacity>
      )}

      {voucher.presentedAt && (
        <Text style={styles.presentedText}>
          Presentato il: {new Date(voucher.presentedAt).toLocaleDateString()}
        </Text>
      )}

      {voucher.verifiedAt && (
        <Text style={styles.verifiedText}>
          Verificato il: {new Date(voucher.verifiedAt).toLocaleDateString()}
        </Text>
      )}
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
  disabledCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiContainer: {
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sponsor: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
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
  valueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    alignItems: 'center',
  },
  valueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  valueLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  costText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#f59e0b',
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  redeemButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  useButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  presentedText: {
    fontSize: 11,
    color: '#f59e0b',
    textAlign: 'center',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 4,
  },
});