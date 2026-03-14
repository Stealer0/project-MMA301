import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, onClose, onConfirm, confirmText, type = 'info' }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle-outline', color: '#82C974' };
      case 'error':
        return { name: 'alert-circle-outline', color: '#FF5252' };
      case 'warning':
        return { name: 'warning-outline', color: '#FFD740' };
      case 'confirm':
        return { name: 'help-circle-outline', color: '#CB9F42' };
      default:
        return { name: 'information-circle-outline', color: '#CB9F42' };
    }
  };

  const icon = getIcon();

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.alertBox, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon.name} size={48} color={icon.color} />
          </View>
          
          <Text style={styles.title}>{title || 'Thông báo'}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose} 
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, onConfirm ? styles.confirmButton : null]} 
              onPress={onConfirm || onClose} 
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{confirmText || 'Đóng'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: width * 0.85,
    backgroundColor: '#1B1924',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#332D41',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CB9F42',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#A09EAD',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: '#CB9F42',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#332D41',
  },
  confirmButton: {
    backgroundColor: '#CB9F42',
  },
  buttonText: {
    color: '#0A0910',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#A09EAD',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
