import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '../../utils/dateHelpers';

export default function TodayOverview({ classes }) {
  if (!classes || classes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No classes today 🎉</Text>
        <Text style={styles.emptySubtext}>Enjoy your day off!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Classes</Text>
      {classes.map((classItem) => (
        <TouchableOpacity 
          key={classItem.id} 
          style={[styles.classItem, { borderLeftColor: classItem.color }]}
        >
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classItem.subjectName}</Text>
            <Text style={styles.classDetail}>
              {classItem.instructorName} • Room {classItem.room}
            </Text>
            <Text style={styles.classTime}>
              {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  classItem: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  classDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  classTime: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    marginTop: 4,
  },
});