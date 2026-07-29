import StorageService from './StorageService';

const CLASSES_KEY = '@classes';

class ClassStorage {
  static async getClasses() {
    const data = await StorageService.getData(CLASSES_KEY);
    return data || [];
  }

  static async saveClass(classData) {
    const classes = await this.getClasses();
    classes.push({
      id: Date.now().toString(),
      ...classData,
      createdAt: new Date().toISOString()
    });
    await StorageService.saveData(CLASSES_KEY, classes);
    return classes;
  }

  static async updateClass(id, updatedData) {
    const classes = await this.getClasses();
    const index = classes.findIndex(c => c.id === id);
    if (index !== -1) {
      classes[index] = { ...classes[index], ...updatedData };
      await StorageService.saveData(CLASSES_KEY, classes);
    }
    return classes;
  }

  static async deleteClass(id) {
    const classes = await this.getClasses();
    const filtered = classes.filter(c => c.id !== id);
    await StorageService.saveData(CLASSES_KEY, filtered);
    return filtered;
  }

  static async getClassById(id) {
    const classes = await this.getClasses();
    return classes.find(c => c.id === id) || null;
  }

  static async getClassesByDay(day) {
    const classes = await this.getClasses();
    return classes.filter(c => c.day === day);
  }

  static async clearAllClasses() {
    await StorageService.saveData(CLASSES_KEY, []);
    return [];
  }
}

export default ClassStorage;