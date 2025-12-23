import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';

const { width } = Dimensions.get('window');

interface ToastProps {
  visible: boolean;
  message: string;
  messageAr?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  messageAr,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          bgColors: ['#4CAF50', '#388E3C'],
          iconColor: '#fff',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          bgColors: ['#F44336', '#D32F2F'],
          iconColor: '#fff',
        };
      case 'warning':
        return {
          icon: 'alert',
          bgColors: ['#FF9800', '#F57C00'],
          iconColor: '#fff',
        };
      case 'info':
      default:
        return {
          icon: 'information',
          bgColors: ['#2196F3', '#1976D2'],
          iconColor: '#fff',
        };
    }
  };

  const { icon, bgColors, iconColor } = getIconAndColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bgColors[0] }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
        <View style={styles.content}>
          {messageAr && (
            <Text style={[styles.message, styles.messageAr]}>{messageAr}</Text>
          )}
          <Text style={styles.message}>{message}</Text>
        </View>
        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{action.text}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="close" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    ...shadows.large,
  },
  content: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  messageAr: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: spacing.xs,
  },
});

// Hook for easier usage
let showToastGlobal: ((props: Omit<ToastProps, 'visible'>) => void) | null = null;

export const setShowToast = (showFn: (props: Omit<ToastProps, 'visible'>) => void) => {
  showToastGlobal = showFn;
};

export const showToast = (props: Omit<ToastProps, 'visible'>) => {
  if (showToastGlobal) {
    showToastGlobal(props);
  } else if (__DEV__) {
    console.warn('Toast not initialized. Make sure ToastProvider is mounted.');
  }
};



