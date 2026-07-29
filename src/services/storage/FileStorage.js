import StorageService from './StorageService';

const FILES_KEY = '@files';

class FileStorage {
  static async getFiles() {
    return await StorageService.getData(FILES_KEY) || [];
  }

  static async saveFile(fileData) {
    const files = await this.getFiles();
    files.push({
      id: Date.now().toString(),
      ...fileData,
      uploadedAt: new Date().toISOString()
    });
    await StorageService.saveData(FILES_KEY, files);
    return files;
  }

  static async deleteFile(id) {
    const files = await this.getFiles();
    const filtered = files.filter(f => f.id !== id);
    await StorageService.saveData(FILES_KEY, filtered);
    return filtered;
  }

  static async getFilesByType(type) {
    const files = await this.getFiles();
    return files.filter(f => f.type === type);
  }

  static async getFilesBySubject(subject) {
    const files = await this.getFiles();
    return files.filter(f => f.subject === subject);
  }

  static async clearFiles() {
    await StorageService.saveData(FILES_KEY, []);
    return [];
  }
}

export default FileStorage;