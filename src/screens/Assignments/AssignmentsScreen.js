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
import AssignmentStorage from '../../services/storage/AssignmentStorage';

const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_COLORS = {
  'High': '#FF3B30',
  'Medium': '#FF9500',
  'Low': '#34C759',
};

export default function AssignmentsScreen() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'Medium',
    description: '',
  });

  const loadTasks = async () => {
    try {
      const allTasks = await AssignmentStorage.getAssignments();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }
    
    return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.dueDate) {
      Alert.alert('Error', 'Please fill in title and due date');
      return;
    }

    try {
      if (editingTask) {
        await AssignmentStorage.updateAssignment(editingTask.id, formData);
      } else {
        await AssignmentStorage.saveAssignment(formData);
      }
      
      setModalVisible(false);
      setEditingTask(null);
      setFormData({
        title: '',
        subject: '',
        dueDate: '',
        priority: 'Medium',
        description: '',
      });
      await loadTasks();
      Alert.alert('Success', editingTask ? 'Task updated successfully!' : 'Task added successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AssignmentStorage.deleteAssignment(id);
              await loadTasks();
              Alert.alert('Success', 'Task deleted successfully!');
            } catch (error) {
              console.error('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async (id) => {
    try {
      await AssignmentStorage.toggleComplete(id);
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.completedCard]}
      onPress={() => {
        setEditingTask(item);
        setFormData({
          title: item.title,
          subject: item.subject || '',
          dueDate: item.dueDate,
          priority: item.priority || 'Medium',
          description: item.description || '',
        });
        setModalVisible(true);
      }}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <TouchableOpacity
            onPress={() => handleToggleComplete(item.id)}
            style={styles.checkbox}
          >
            <View style={[
              styles.checkboxInner,
              item.completed && styles.checkboxChecked,
            ]}>
              {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={[
            styles.taskTitle,
            item.completed && styles.completedText,
          ]}>
            {item.title}
          </Text>
        </View>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: PRIORITY_COLORS[item.priority] },
        ]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      
      <View style={styles.taskDetails}>
        <Text style={styles.taskSubject}>
          <Ionicons name="book-outline" size={14} color="#666" /> {item.subject || 'No subject'}
        </Text>
        <Text style={styles.taskDue}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      </View>
      
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      {item.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✓ Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📝 Tasks</Text>
          <Text style={styles.subtitle}>{filteredTasks.length} tasks</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingTask(null);
            setFormData({
              title: '',
              subject: '',
              dueDate: '',
              priority: 'Medium',
              description: '',
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Pending" value="pending" />
        <FilterButton title="Completed" value="completed" />
      </View>

      <View style={styles.listContainer}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first task</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
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
                  {editingTask ? 'Edit Task' : 'New Task'}
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
                  placeholder="e.g. Complete Math Homework"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="book-outline" size={16} color="#666" /> Subject
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.subject}
                  onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar-outline" size={16} color="#666" /> Due Date *
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="flag-outline" size={16} color="#666" /> Priority
                </Text>
                <View style={styles.priorityPicker}>
                  {PRIORITIES.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        formData.priority === p && styles.priorityButtonActive,
                        { backgroundColor: formData.priority === p ? PRIORITY_COLORS[p] : '#F2F2F7' },
                      ]}
                      onPress={() => setFormData({ ...formData, priority: p })}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        formData.priority === p && styles.priorityButtonTextActive,
                      ]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Additional details..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
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
  completedCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    color: '#666',
  },
  taskDue: {
    fontSize: 14,
    color: '#666',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  completedBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#34C759',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  priorityPicker: {
    flexDirection: 'row',
    marginTop: 4,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: '#FFFFFF',
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