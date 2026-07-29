import StorageService from './StorageService';

const ATTENDANCE_KEY = '@attendance';

class AttendanceStorage {
  static async getAttendance() {
    return await StorageService.getData(ATTENDANCE_KEY) || {};
  }

  static async markAttendance(subjectId, date, status) {
    const attendance = await this.getAttendance();
    
    if (!attendance[subjectId]) {
      attendance[subjectId] = [];
    }
    
    const existing = attendance[subjectId].findIndex(a => a.date === date);
    if (existing !== -1) {
      attendance[subjectId][existing].status = status;
    } else {
      attendance[subjectId].push({ date, status });
    }
    
    await StorageService.saveData(ATTENDANCE_KEY, attendance);
    return attendance;
  }

  static async getAttendanceBySubject(subjectId) {
    const attendance = await this.getAttendance();
    return attendance[subjectId] || [];
  }

  static async getAttendanceStats(subjectId) {
    const records = await this.getAttendanceBySubject(subjectId);
    const total = records.length;
    
    if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, percentage: 0 };
    
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    
    const percentage = ((present + late) / total) * 100;
    
    return { present, absent, late, excused, total, percentage };
  }

  static async clearAttendance() {
    await StorageService.saveData(ATTENDANCE_KEY, {});
    return {};
  }
}

export default AttendanceStorage;