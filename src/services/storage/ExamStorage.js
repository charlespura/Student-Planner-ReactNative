import StorageService from './StorageService';

const EXAMS_KEY = '@exams';

class ExamStorage {
  static async getExams() {
    return await StorageService.getData(EXAMS_KEY) || [];
  }

  static async saveExam(examData) {
    const exams = await this.getExams();
    exams.push({
      id: Date.now().toString(),
      ...examData,
      createdAt: new Date().toISOString()
    });
    await StorageService.saveData(EXAMS_KEY, exams);
    return exams;
  }

  static async updateExam(id, updatedData) {
    const exams = await this.getExams();
    const index = exams.findIndex(e => e.id === id);
    if (index !== -1) {
      exams[index] = { ...exams[index], ...updatedData };
      await StorageService.saveData(EXAMS_KEY, exams);
    }
    return exams;
  }

  static async deleteExam(id) {
    const exams = await this.getExams();
    const filtered = exams.filter(e => e.id !== id);
    await StorageService.saveData(EXAMS_KEY, filtered);
    return filtered;
  }

  static async getUpcomingExams() {
    const exams = await this.getExams();
    const now = new Date();
    return exams
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  static async getExamsBySubject(subject) {
    const exams = await this.getExams();
    return exams.filter(e => e.subject === subject);
  }
}

export default ExamStorage;