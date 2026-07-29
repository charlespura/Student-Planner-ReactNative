export default class Class {
  constructor({
    id,
    subjectName,
    instructorName,
    room,
    day,
    startTime,
    endTime,
    color,
    createdAt
  }) {
    this.id = id || Date.now().toString();
    this.subjectName = subjectName;
    this.instructorName = instructorName || '';
    this.room = room || '';
    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
    this.color = color || this.getRandomColor();
    this.createdAt = createdAt || new Date().toISOString();
  }

  getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getDuration() {
    const start = new Date(`1970-01-01T${this.startTime}`);
    const end = new Date(`1970-01-01T${this.endTime}`);
    return (end - start) / (1000 * 60 * 60); // Hours
  }

  isValid() {
    return this.subjectName && this.subjectName.trim() !== '' &&
           this.day && this.startTime && this.endTime;
  }
}