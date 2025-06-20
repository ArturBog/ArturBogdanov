/**
 * Генерирует уникальный идентификатор
 * @returns {string} Уникальный идентификатор
 */
export const generateId = () => {
  // Генерируем случайную строку на основе текущего времени и случайного числа
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};