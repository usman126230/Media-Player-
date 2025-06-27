import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Play,
  FileVideo,
  Music,
  Plus,
  MoreVertical,
  Clock,
  Trash2,
} from 'lucide-react-native';

interface MediaFile {
  id: string;
  name: string;
  uri: string;
  type: 'video' | 'audio';
  size: number;
  duration?: number;
  thumbnail?: string;
  addedAt: Date;
}

export default function LibraryScreen() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'audio'>('all');

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    // In a real app, you'd load from AsyncStorage or a database
    // For demo purposes, we'll start with an empty array
    setMediaFiles([]);
  };

  const addMediaFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles: MediaFile[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          name: asset.name || 'Unknown',
          uri: asset.uri,
          type: asset.mimeType?.startsWith('video/') ? 'video' : 'audio',
          size: asset.size || 0,
          addedAt: new Date(),
        }));

        setMediaFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add media files');
    }
  };

  const removeMediaFile = (id: string) => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMediaFiles(prev => prev.filter(file => file.id !== id));
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    if (selectedType === 'all') return true;
    return file.type === selectedType;
  });

  const renderMediaFile = ({ item }: { item: MediaFile }) => (
    <TouchableOpacity style={styles.mediaItem}>
      <View style={styles.mediaIcon}>
        {item.type === 'video' ? (
          <FileVideo size={24} color="#3B82F6" />
        ) : (
          <Music size={24} color="#10B981" />
        )}
      </View>
      
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.mediaDetails}>
          <Text style={styles.mediaSize}>{formatFileSize(item.size)}</Text>
          <Text style={styles.mediaDot}>•</Text>
          <Text style={styles.mediaDate}>
            {item.addedAt.toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.mediaActions}>
        <TouchableOpacity style={styles.playButton}>
          <Play size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => removeMediaFile(item.id)}
        >
          <MoreVertical size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#374151', '#4B5563']}
        style={styles.emptyCard}
      >
        <FileVideo size={48} color="#6B7280" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No Media Files</Text>
        <Text style={styles.emptySubtitle}>
          Add videos and audio files to build your library
        </Text>
        <TouchableOpacity style={styles.addFirstButton} onPress={addMediaFile}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addFirstButtonText}>Add Files</Text>
        </TouchableOpacity>
      </LinearGradient>
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
        <Text style={styles.title}>Media Library</Text>
        <TouchableOpacity style={styles.addButton} onPress={addMediaFile}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'video', 'audio'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              selectedType === type && styles.filterTabActive,
            ]}
            onPress={() => setSelectedType(type as 'all' | 'video' | 'audio')}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedType === type && styles.filterTabTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && (
                <Text style={styles.filterCount}>
                  {' '}({mediaFiles.filter(f => f.type === type).length})
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Media List */}
      <FlatList
        data={filteredFiles}
        renderItem={renderMediaFile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Stats Bar */}
      {mediaFiles.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <FileVideo size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {mediaFiles.filter(f => f.type === 'video').length} Videos
            </Text>
          </View>
          <View style={styles.statItem}>
            <Music size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {mediaFiles.filter(f => f.type === 'audio').length} Audio
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    opacity: 0.7,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  mediaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mediaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaSize: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  mediaDot: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  mediaDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  mediaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 280,
    width: '100%',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginBottom: 70,
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
});