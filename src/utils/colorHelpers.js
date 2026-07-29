export const getColorFromSubject = (subject) => {
  const colors = {
    'Mathematics': '#4A90E2',
    'Science': '#50C878',
    'English': '#FF6B6B',
    'History': '#DDA0DD',
    'Geography': '#FFD93D',
    'Art': '#FF8A80',
    'Music': '#FF69B4',
    'PE': '#4ECDC4',
    'Physics': '#45B7D1',
    'Chemistry': '#96CEB4',
    'Biology': '#6BCB77',
    'Computer Science': '#7B68EE',
    'Economics': '#F4A460',
    'Business': '#20B2AA',
    'Psychology': '#FFB6C1',
  };
  
  return colors[subject] || '#808080';
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#FF3B30';
    case 'medium': return '#FF9500';
    case 'low': return '#34C759';
    default: return '#8E8E93';
  }
};

export const getContrastTextColor = (backgroundColor) => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

export const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#FF8A80', '#FFD93D',
    '#6BCB77', '#7B68EE', '#F4A460', '#20B2AA'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};