import StorageService from './StorageService';

const NOTES_KEY = '@notes';

class NoteStorage {
  static async getNotes() {
    const data = await StorageService.getData(NOTES_KEY);
    return data || [];
  }

  static async saveNote(noteData) {
    const notes = await this.getNotes();
    notes.push({
      id: Date.now().toString(),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false
    });
    await StorageService.saveData(NOTES_KEY, notes);
    return notes;
  }

  static async updateNote(id, updatedData) {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { 
        ...notes[index], 
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      await StorageService.saveData(NOTES_KEY, notes);
    }
    return notes;
  }

  static async deleteNote(id) {
    const notes = await this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    await StorageService.saveData(NOTES_KEY, filtered);
    return filtered;
  }

  static async togglePin(id) {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].pinned = !notes[index].pinned;
      await StorageService.saveData(NOTES_KEY, notes);
    }
    return notes;
  }

  static async searchNotes(query) {
    const notes = await this.getNotes();
    const searchTerm = query.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchTerm) ||
      n.content.toLowerCase().includes(searchTerm)
    );
  }

  static async getPinnedNotes() {
    const notes = await this.getNotes();
    return notes.filter(n => n.pinned);
  }

  static async clearAllNotes() {
    await StorageService.saveData(NOTES_KEY, []);
    return [];
  }
}

export default NoteStorage;