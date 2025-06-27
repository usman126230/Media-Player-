import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Volume2,
  Display,
  Zap,
  Shield,
  Info,
  ChevronRight,
  Smartphone,
  Headphones,
  Eye,
  Battery,
} from 'lucide-react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    autoPlay: true,
    hapticFeedback: true,
    keepScreenOn: false,
    hardwareAcceleration: true,
    backgroundPlayback: true,
    autoQualityAdjust: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const playbackSettings: SettingItem[] = [
    {
      id: 'autoPlay',
      title: 'Auto Play',
      subtitle: 'Automatically start playback when media loads',
      icon: <Zap size={20} color="#3B82F6" />,
      type: 'toggle',
      value: settings.autoPlay,
      onToggle: (value) => updateSetting('autoPlay', value),
    },
    {
      id: 'backgroundPlayback',
      title: 'Background Playback',
      subtitle: 'Continue audio playback when app is minimized',
      icon: <Headphones size={20} color="#10B981" />,
      type: 'toggle',
      value: settings.backgroundPlayback,
      onToggle: (value) => updateSetting('backgroundPlayback', value),
    },
    {
      id: 'autoQuality',
      title: 'Auto Quality Adjustment',
      subtitle: 'Automatically adjust quality based on connection',
      icon: <Display size={20} color="#F59E0B" />,
      type: 'toggle',
      value: settings.autoQualityAdjust,
      onToggle: (value) => updateSetting('autoQualityAdjust', value),
    },
  ];

  const interfaceSettings: SettingItem[] = [
    {
      id: 'hapticFeedback',
      title: 'Haptic Feedback',
      subtitle: 'Vibrate when interacting with controls',
      icon: <Smartphone size={20} color="#8B5CF6" />,
      type: 'toggle',
      value: settings.hapticFeedback,
      onToggle: (value) => updateSetting('hapticFeedback', value),
    },
    {
      id: 'keepScreenOn',
      title: 'Keep Screen On',
      subtitle: 'Prevent screen from turning off during playback',
      icon: <Eye size={20} color="#EF4444" />,
      type: 'toggle',
      value: settings.keepScreenOn,
      onToggle: (value) => updateSetting('keepScreenOn', value),
    },
  ];

  const performanceSettings: SettingItem[] = [
    {
      id: 'hardwareAcceleration',
      title: 'Hardware Acceleration',
      subtitle: 'Use GPU for video decoding (recommended)',
      icon: <Battery size={20} color="#06B6D4" />,
      type: 'toggle',
      value: settings.hardwareAcceleration,
      onToggle: (value) => updateSetting('hardwareAcceleration', value),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.0.0',
      icon: <Info size={20} color="#6B7280" />,
      type: 'navigation',
      onPress: () => console.log('About pressed'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: <Shield size={20} color="#059669" />,
      type: 'navigation',
      onPress: () => console.log('Privacy pressed'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>

      <View style={styles.settingAction}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
          />
        )}
        {item.type === 'navigation' && (
          <ChevronRight size={20} color="#6B7280" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <SettingsIcon size={28} color="#FFFFFF" />
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection('Playback', playbackSettings)}
        {renderSection('Interface', interfaceSettings)}
        {renderSection('Performance', performanceSettings)}
        {renderSection('App', appSettings)}

        {/* Feature Highlight */}
        <View style={styles.featureHighlight}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.featureCard}
          >
            <Text style={styles.featureTitle}>Professional Features</Text>
            <Text style={styles.featureSubtitle}>
              • Support for 4K, 2K video playback{'\n'}
              • Variable speed control (0.5x - 4x){'\n'}
              • Multiple format support (MP4, MKV, MP3){'\n'}
              • Advanced audio visualization{'\n'}
              • Gesture-based controls
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.2)',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  settingAction: {
    marginLeft: 12,
  },
  featureHighlight: {
    marginTop: 20,
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
  },
  featureTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});