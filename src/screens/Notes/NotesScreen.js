import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NoteStorage from '../../services/storage/NoteStorage';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
  });

  const loadNotes = async () => {
    try {
      const allNotes = await NoteStorage.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [])
  );

  const getFilteredNotes = () => {
    let filtered = [...notes];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
    
    return filtered;
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editingNote) {
        await NoteStorage.updateNote(editingNote.id, formData);
      } else {
        await NoteStorage.saveNote(formData);
      }
      
      setModalVisible(false);
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        subject: '',
      });
      await loadNotes();
      Alert.alert('Success', editingNote ? 'Note updated successfully!' : 'Note added successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NoteStorage.deleteNote(id);
              await loadNotes();
              Alert.alert('Success', 'Note deleted successfully!');
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          },
        },
      ]
    );
  };

  const handleTogglePin = async (id) => {
    try {
      await NoteStorage.togglePin(id);
      await loadNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.noteCard,
        item.pinned && styles.pinnedCard,
      ]}
      onPress={() => {
        setEditingNote(item);
        setFormData({
          title: item.title,
          content: item.content,
          subject: item.subject || '',
        });
        setModalVisible(true);
      }}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteTitleContainer}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.pinned && '📌 '}{item.title}
          </Text>
          {item.subject && (
            <View style={[styles.subjectTag, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.subjectTagText}>{item.subject}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleTogglePin(item.id)}
          style={styles.pinButton}
        >
          <Ionicons name={item.pinned ? 'pin' : 'pin-outline'} size={20} color={item.pinned ? '#FFD93D' : '#999'} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
        </Text>
        {item.pinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedBadgeText}>Pinned</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredNotes = getFilteredNotes();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📖 Notes</Text>
          <Text style={styles.subtitle}>{filteredNotes.length} notes</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingNote(null);
            setFormData({
              title: '',
              content: '',
              subject: '',
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search notes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Tap the + button to add your first note'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="document-text-outline" size={16} color="#666" /> Title *
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Note title..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="create-outline" size={16} color="#666" /> Content *
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  placeholder="Write your note here..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="book-outline" size={16} color="#666" /> Subject (Optional)
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.subject}
                  onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#000000',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pinnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  subjectTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  pinButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  pinnedBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pinnedBadgeText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});