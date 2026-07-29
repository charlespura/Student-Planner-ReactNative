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
import ClassStorage from '../../services/storage/ClassStorage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80', '#007AFF'];

export default function ScheduleScreen() {
  const [classes, setClasses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [formData, setFormData] = useState({
    subjectName: '',
    instructorName: '',
    room: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    color: '#007AFF',
  });

  const loadClasses = async () => {
    try {
      const allClasses = await ClassStorage.getClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadClasses();
    }, [])
  );

  const filteredClasses = classes.filter(c => c.day === selectedDay);

  const handleSave = async () => {
    if (!formData.subjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      if (editingClass) {
        await ClassStorage.updateClass(editingClass.id, formData);
      } else {
        await ClassStorage.saveClass(formData);
      }
      
      setModalVisible(false);
      setEditingClass(null);
      setFormData({
        subjectName: '',
        instructorName: '',
        room: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        color: '#007AFF',
      });
      await loadClasses();
      Alert.alert('Success', editingClass ? 'Class updated successfully!' : 'Class added successfully!');
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Error', 'Failed to save class');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClassStorage.deleteClass(id);
              await loadClasses();
              Alert.alert('Success', 'Class deleted successfully!');
            } catch (error) {
              console.error('Error deleting class:', error);
            }
          },
        },
      ]
    );
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.classCard, { borderLeftColor: item.color || '#007AFF' }]}
      onPress={() => {
        setEditingClass(item);
        setFormData({
          subjectName: item.subjectName,
          instructorName: item.instructorName || '',
          room: item.room || '',
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          color: item.color || '#007AFF',
        });
        setModalVisible(true);
      }}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.classContent}>
        <View style={styles.classHeader}>
          <View style={[styles.colorDot, { backgroundColor: item.color || '#007AFF' }]} />
          <Text style={styles.className}>{item.subjectName}</Text>
        </View>
        {item.instructorName && (
          <Text style={styles.classDetail}>
            <Ionicons name="person-outline" size={14} color="#666" /> {item.instructorName}
          </Text>
        )}
        {item.room && (
          <Text style={styles.classDetail}>
            <Ionicons name="location-outline" size={14} color="#666" /> Room {item.room}
          </Text>
        )}
        <Text style={styles.classTime}>
          <Ionicons name="time-outline" size={14} color="#007AFF" /> {item.startTime} - {item.endTime}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📚 Schedule</Text>
          <Text style={styles.subtitle}>{selectedDay}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingClass(null);
            setFormData({
              subjectName: '',
              instructorName: '',
              room: '',
              day: selectedDay,
              startTime: '09:00',
              endTime: '10:00',
              color: '#007AFF',
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDay === day && styles.dayButtonTextActive,
            ]}>
              {day.substring(0, 3)}
            </Text>
            <Text style={[
              styles.dayButtonFull,
              selectedDay === day && styles.dayButtonTextActive,
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.classList}>
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No classes on {selectedDay}</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add a class</Text>
          </View>
        ) : (
          <FlatList
            data={filteredClasses.sort((a, b) => a.startTime.localeCompare(b.startTime))}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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
                  {editingClass ? 'Edit Class' : 'New Class'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="book-outline" size={16} color="#666" /> Subject Name *
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.subjectName}
                  onChangeText={(text) => setFormData({ ...formData, subjectName: text })}
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={16} color="#666" /> Instructor
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.instructorName}
                  onChangeText={(text) => setFormData({ ...formData, instructorName: text })}
                  placeholder="e.g. Dr. Smith"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="location-outline" size={16} color="#666" /> Room
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.room}
                  onChangeText={(text) => setFormData({ ...formData, room: text })}
                  placeholder="e.g. Room 201"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar-outline" size={16} color="#666" /> Day
                </Text>
                <View style={styles.dayPicker}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayPickerButton,
                        formData.day === day && styles.dayPickerButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, day })}
                    >
                      <Text style={[
                        styles.dayPickerText,
                        formData.day === day && styles.dayPickerTextActive,
                      ]}>
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="time-outline" size={16} color="#666" /> Start
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.startTime}
                    onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                    placeholder="09:00"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="time-outline" size={16} color="#666" /> End
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.endTime}
                    onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                    placeholder="10:00"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.colorPicker}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.color === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </View>
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
  daySelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  dayButtonFull: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  classList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classContent: {
    flex: 1,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  classDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  classTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
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
  rowInputs: {
    flexDirection: 'row',
  },
  dayPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dayPickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    margin: 4,
  },
  dayPickerButtonActive: {
    backgroundColor: '#007AFF',
  },
  dayPickerText: {
    fontSize: 13,
    color: '#666',
  },
  dayPickerTextActive: {
    color: '#FFFFFF',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#007AFF',
    borderWidth: 3,
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