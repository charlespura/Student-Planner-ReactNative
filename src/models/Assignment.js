export default class Assignment {
  constructor({
    id,
    title,
    subject,
    dueDate,
    priority,
    description,
    completed,
    createdAt
  }) {
    this.id = id || Date.now().toString();
    this.title = title;
    this.subject = subject;
    this.dueDate = dueDate;
    this.priority = priority || 'medium';
    this.description = description || '';
    this.completed = completed || false;
    this.createdAt = createdAt || new Date().toISOString();
  }

  getPriorityColor() {
    const colors = {
      high: '#FF6B6B',
      medium: '#FFD93D',
      low: '#6BCB77'
    };
    return colors[this.priority] || colors.medium;
  }

  getDaysUntilDue() {
    const due = new Date(this.dueDate);
    const now = new Date();
    const diffTime = due - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue() {
    return !this.completed && this.getDaysUntilDue() < 0;
  }

  isValid() {
    return this.title && this.title.trim() !== '' &&
           this.subject && this.dueDate;
  }
}