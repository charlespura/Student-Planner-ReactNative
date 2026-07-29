export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const getDayOfWeek = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

export const getWeekDays = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - today + i);
    weekDays.push({
      day: days[i],
      date: date,
      isToday: i === today
    });
  }
  return weekDays;
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCountdown = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};