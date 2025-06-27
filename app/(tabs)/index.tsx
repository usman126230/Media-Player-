import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  RotateCcw,
  RotateCw,
  Settings as SettingsIcon,
  FileVideo,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface PlaybackSpeeds {
  [key: string]: number;
}

const PLAYBACK_SPEEDS: PlaybackSpeeds = {
  '0.5x': 0.5,
  '0.75x': 0.75,
  '1x': 1.0,
  '1.25x': 1.25,
  '1.5x': 1.5,
  '2x': 2.0,
  '3x': 3.0,
  '4x': 4.0,
};

export default function PlayerScreen() {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState('1x');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    resetControlsTimeout();
  }, [showControls]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setVideoUri(asset.uri);
        setCurrentFileName(asset.name || 'Unknown');
        triggerHaptic();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media file');
    }
  };

  const togglePlayPause = async () => {
    triggerHaptic();
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
    setShowControls(true);
    resetControlsTimeout();
  };

  const changeSpeed = () => {
    triggerHaptic();
    const speeds = Object.keys(PLAYBACK_SPEEDS);
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    
    setCurrentSpeed(nextSpeed);
    
    if (videoRef.current) {
      videoRef.current.setRateAsync(PLAYBACK_SPEEDS[nextSpeed], true);
    }
    setShowControls(true);
    resetControlsTimeout();
  };

  const seekBackward = async () => {
    triggerHaptic();
    if (videoRef.current && 'positionMillis' in status) {
      const newPosition = Math.max(0, (status.positionMillis || 0) - 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
    setShowControls(true);
    resetControlsTimeout();
  };

  const seekForward = async () => {
    triggerHaptic();
    if (videoRef.current && 'positionMillis' in status && 'durationMillis' in status) {
      const newPosition = Math.min(
        status.durationMillis || 0,
        (status.positionMillis || 0) + 10000
      );
      await videoRef.current.setPositionAsync(newPosition);
    }
    setShowControls(true);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    triggerHaptic();
    setIsFullscreen(!isFullscreen);
    setShowControls(true);
    resetControlsTimeout();
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoTap = () => {
    setShowControls(!showControls);
    if (!showControls) {
      resetControlsTimeout();
    }
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if ('isLoaded' in playbackStatus) {
      setIsPlaying(playbackStatus.isPlaying || false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      />
      
      {!videoUri ? (
        <View style={styles.welcomeContainer}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.welcomeCard}
          >
            <FileVideo size={64} color="#FFFFFF" style={styles.welcomeIcon} />
            <Text style={styles.welcomeTitle}>Advanced Media Player</Text>
            <Text style={styles.welcomeSubtitle}>
              Play MP4, MKV, 4K, 2K videos and MP3 audio files with professional controls
            </Text>
            <TouchableOpacity style={styles.selectButton} onPress={pickVideo}>
              <Text style={styles.selectButtonText}>Select Media File</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenContainer]}>
          <TouchableOpacity 
            style={styles.videoTouchArea} 
            onPress={handleVideoTap}
            activeOpacity={1}
          >
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.video}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              volume={volume}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          </TouchableOpacity>

          {showControls && (
            <BlurView intensity={20} style={styles.controlsOverlay}>
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.controlsGradient}
              >
                {/* Top Controls */}
                <View style={styles.topControls}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {currentFileName}
                  </Text>
                  <TouchableOpacity onPress={toggleFullscreen}>
                    <Maximize size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Center Controls */}
                <View style={styles.centerControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
                    <RotateCcw size={32} color="#FFFFFF" />
                    <Text style={styles.controlLabel}>-10s</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                    {isPlaying ? (
                      <Pause size={48} color="#FFFFFF" />
                    ) : (
                      <Play size={48} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
                    <RotateCw size={32} color="#FFFFFF" />
                    <Text style={styles.controlLabel}>+10s</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      {'positionMillis' in status ? formatTime(status.positionMillis || 0) : '0:00'}
                    </Text>
                    <Text style={styles.timeText}>
                      {'durationMillis' in status ? formatTime(status.durationMillis || 0) : '0:00'}
                    </Text>
                  </View>

                  <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity style={styles.speedButton} onPress={changeSpeed}>
                      <Text style={styles.speedText}>{currentSpeed}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                      <Volume2 size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                      <SettingsIcon size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          )}
        </View>
      )}

      {/* Bottom Action Bar */}
      {!isFullscreen && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={pickVideo}>
            <FileVideo size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Select File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Library size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Recent</Text>
          </TouchableOpacity>
        </View>
      )}
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  videoTouchArea: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  fileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#E2E8F0',
  },
  playButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    padding: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bottomControls: {
    gap: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#E2E8F0',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  speedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  iconButton: {
    padding: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginBottom: 70,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
});