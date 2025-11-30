export function convertDate(dateStr: string): string {
    const date = new Date(dateStr);
    
    // Получаем части даты
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();
    
    // Получаем части времени
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Собираем конечный результат
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}