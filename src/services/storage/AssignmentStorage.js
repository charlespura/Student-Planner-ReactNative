import StorageService from './StorageService';

const ASSIGNMENTS_KEY = '@assignments';

class AssignmentStorage {
  static async getAssignments() {
    const data = await StorageService.getData(ASSIGNMENTS_KEY);
    return data || [];
  }

  static async saveAssignment(assignmentData) {
    const assignments = await this.getAssignments();
    assignments.push({
      id: Date.now().toString(),
      ...assignmentData,
      createdAt: new Date().toISOString(),
      completed: false
    });
    await StorageService.saveData(ASSIGNMENTS_KEY, assignments);
    return assignments;
  }

  static async updateAssignment(id, updatedData) {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updatedData };
      await StorageService.saveData(ASSIGNMENTS_KEY, assignments);
    }
    return assignments;
  }

  static async deleteAssignment(id) {
    const assignments = await this.getAssignments();
    const filtered = assignments.filter(a => a.id !== id);
    await StorageService.saveData(ASSIGNMENTS_KEY, filtered);
    return filtered;
  }

  static async toggleComplete(id) {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      assignments[index].completed = !assignments[index].completed;
      await StorageService.saveData(ASSIGNMENTS_KEY, assignments);
    }
    return assignments;
  }

  static async getAssignmentsBySubject(subject) {
    const assignments = await this.getAssignments();
    return assignments.filter(a => a.subject === subject);
  }

  static async getUpcomingAssignments() {
    const assignments = await this.getAssignments();
    const today = new Date();
    return assignments
      .filter(a => !a.completed && new Date(a.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  static async getOverdueAssignments() {
    const assignments = await this.getAssignments();
    const today = new Date();
    return assignments
      .filter(a => !a.completed && new Date(a.dueDate) < today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  static async clearAllAssignments() {
    await StorageService.saveData(ASSIGNMENTS_KEY, []);
    return [];
  }
}

export default AssignmentStorage;