import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ClassStorage from '../../services/storage/ClassStorage';
import AssignmentStorage from '../../services/storage/AssignmentStorage';
import NoteStorage from '../../services/storage/NoteStorage';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalClasses: 0,
    pendingAssignments: 0,
    totalNotes: 0,
    todayClasses: 0,
  });
  const [todayClassesList, setTodayClassesList] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const allClasses = await ClassStorage.getClasses();
      const todayClasses = allClasses.filter(c => c.day === today);
      
      const allAssignments = await AssignmentStorage.getAssignments();
      const pending = allAssignments.filter(a => !a.completed);
      const upcoming = pending
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      
      const allNotes = await NoteStorage.getNotes();
      
      setStats({
        totalClasses: allClasses.length,
        pendingAssignments: pending.length,
        totalNotes: allNotes.length,
        todayClasses: todayClasses.length,
      });
      
      setTodayClassesList(todayClasses);
      setUpcomingAssignments(upcoming);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.subtitle}>Welcome back to your planner</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={44} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={[styles.statCard, styles.statCard1]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar" size={28} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.todayClasses}</Text>
          <Text style={styles.statLabel}>Today's Classes</Text>
          <Text style={styles.statSubtext}>Tap to view →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, styles.statCard2]}
          onPress={() => navigation.navigate('Tasks')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="book" size={28} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.pendingAssignments}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
          <Text style={styles.statSubtext}>Tap to view →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, styles.statCard3]}
          onPress={() => navigation.navigate('Notes')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="document-text" size={28} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.totalNotes}</Text>
          <Text style={styles.statLabel}>Total Notes</Text>
          <Text style={styles.statSubtext}>Tap to view →</Text>
        </TouchableOpacity>
      </View>

      {todayClassesList.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={22} color="#007AFF" />
            <Text style={styles.cardTitle}>Today's Classes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {todayClassesList.map((cls) => (
            <View key={cls.id} style={[styles.classItem, { borderLeftColor: cls.color || '#007AFF' }]}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.subjectName}</Text>
                <Text style={styles.classDetail}>
                  <Ionicons name="person" size={14} color="#666" /> {cls.instructorName || 'No instructor'}
                </Text>
                <Text style={styles.classDetail}>
                  <Ionicons name="location" size={14} color="#666" /> {cls.room || 'No room'}
                </Text>
              </View>
              <View style={styles.classTimeContainer}>
                <Ionicons name="time-outline" size={16} color="#007AFF" />
                <Text style={styles.classTime}>
                  {cls.startTime} - {cls.endTime}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {upcomingAssignments.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="clipboard" size={22} color="#FF9500" />
            <Text style={styles.cardTitle}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingAssignments.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskLeft}>
                <View style={[styles.priorityDot, { 
                  backgroundColor: task.priority === 'High' ? '#FF3B30' : 
                                  task.priority === 'Medium' ? '#FF9500' : '#34C759' 
                }]} />
                <View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubject}>
                    <Ionicons name="book-outline" size={14} color="#666" /> {task.subject || 'No subject'}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskDue}>
                <Ionicons name="calendar-outline" size={14} color="#666" /> 
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Schedule')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="add-circle" size={28} color="#007AFF" />
            </View>
            <Text style={styles.actionLabel}>Add Class</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tasks')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="add-circle" size={28} color="#FF9500" />
            </View>
            <Text style={styles.actionLabel}>Add Task</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="create" size={28} color="#34C759" />
            </View>
            <Text style={styles.actionLabel}>Add Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 50,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: -20,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  classItem: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  classDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  classTimeContainer: {
    alignItems: 'center',
  },
  classTime: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  taskSubject: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  taskDue: {
    fontSize: 13,
    color: '#666',
  },
  quickActions: {
    margin: 16,
    marginTop: 0,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 13,
    color: '#666',
  },
});