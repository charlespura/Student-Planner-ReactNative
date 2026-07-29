import StorageService from './StorageService';

const GPA_KEY = '@gpa_subjects';

class GPAStorage {
  static async getSubjects() {
    return await StorageService.getData(GPA_KEY) || [];
  }

  static async addSubject(subjectData) {
    const subjects = await this.getSubjects();
    subjects.push({
      id: Date.now().toString(),
      name: subjectData.name,
      grade: subjectData.grade,
      credits: parseFloat(subjectData.credits) || 0,
      createdAt: new Date().toISOString()
    });
    await StorageService.saveData(GPA_KEY, subjects);
    return subjects;
  }

  static async updateSubject(id, updatedData) {
    const subjects = await this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      subjects[index] = { ...subjects[index], ...updatedData };
      await StorageService.saveData(GPA_KEY, subjects);
    }
    return subjects;
  }

  static async deleteSubject(id) {
    const subjects = await this.getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    await StorageService.saveData(GPA_KEY, filtered);
    return filtered;
  }

  static async calculateGPA() {
    const subjects = await this.getSubjects();
    if (subjects.length === 0) return { gpa: 0, totalCredits: 0 };
    
    const gradePoints = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    subjects.forEach(subject => {
      const points = gradePoints[subject.grade] || 0;
      const credits = subject.credits || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });
    
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { gpa: parseFloat(gpa.toFixed(2)), totalCredits };
  }

  static async resetGPA() {
    await StorageService.saveData(GPA_KEY, []);
    return [];
  }
}

export default GPAStorage;