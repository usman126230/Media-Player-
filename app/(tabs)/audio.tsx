import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Music,
  Heart,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AudioScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
      startRotateAnimation();
    } else {
      stopAnimations();
    }
  }, [isPlaying]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    rotateAnim.stopAnimation();
  };

  const pickAudio = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: asset.uri },
          { shouldPlay: false }
        );
        
        setSound(newSound);
        setCurrentTrack(asset.uri);
        setTrackName(asset.name || 'Unknown Track');
        
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }
      }
    } catch (error) {
      console.error('Error picking audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      />

      {!currentTrack ? (
        <View style={styles.welcomeContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.welcomeCard}
          >
            <Music size={64} color="#FFFFFF" style={styles.welcomeIcon} />
            <Text style={styles.welcomeTitle}>Audio Player</Text>
            <Text style={styles.welcomeSubtitle}>
              Play your favorite MP3 and audio files with rich visualizations
            </Text>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={pickAudio}
              disabled={isLoading}
            >
              <Text style={styles.selectButtonText}>
                {isLoading ? 'Loading...' : 'Select Audio File'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.playerContainer}>
          {/* Audio Visualizer */}
          <View style={styles.visualizerContainer}>
            <Animated.View
              style={[
                styles.albumArt,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: spin }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.albumArtGradient}
              >
                <Music size={80} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={2}>
              {trackName}
            </Text>
            <Text style={styles.artistName}>Unknown Artist</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progress, 
                  { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Shuffle size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <SkipBack size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton} 
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <SkipForward size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Repeat size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Secondary Controls */}
          <View style={styles.secondaryControls}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Heart size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Volume2 size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Action */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.changeTrackButton} onPress={pickAudio}>
          <Music size={20} color="#10B981" />
          <Text style={styles.changeTrackText}>Change Track</Text>
        </TouchableOpacity>
      </View>
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
  playerContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    justifyContent: 'space-between',
  },
  visualizerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  albumArt: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  albumArtGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginVertical: 30,
  },
  trackName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  artistName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#94A3B8',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 2,
    marginBottom: 12,
  },
  progress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    gap: 20,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    backgroundColor: '#10B981',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  secondaryButton: {
    padding: 12,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  changeTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8,
  },
  changeTrackText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#10B981',
  },
});