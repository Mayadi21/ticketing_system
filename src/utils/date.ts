// src/utils/date.ts

// Helper internal: Mengubah data string dari DB ke objek Date (memaksa UTC jika tidak ada 'Z')
const parseSafeDate = (dateVal: Date | string) => {
  if (typeof dateVal === "string") {
    const safeString = dateVal.endsWith("Z") ? dateVal : `${dateVal}Z`;
    return new Date(safeString);
  }
  return dateVal;
};

// 1. Mengubah format ke YYYY-MM-DD (WIB) - Untuk Chart Dashboard
export const formatDateToWIB = (dateInput: Date | string) => {
  const date = parseSafeDate(dateInput);
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
};

// 2. Mengambil nama hari singkat (Sen, Sel) - Untuk Chart Dashboard
export const getShortDayNameWIB = (dateInput: Date | string) => {
  const date = parseSafeDate(dateInput);
  return date.toLocaleDateString("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" });
};

// 3. Mengambil format lengkap UI (DD/MM/YYYY, HH.mm.ss) - Untuk Detail Tiket
export const formatFullDateTimeWIB = (dateInput: Date | string) => {
  const date = parseSafeDate(dateInput);
  return date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
};

// 4. Mengambil format khusus form type="datetime-local" - Untuk Form Edit Deadline
export const formatForDatetimeInputWIB = (dateInput: Date | string) => {
  const date = parseSafeDate(dateInput);
  const datePart = date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const timePart = date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
  });
  
  return `${datePart}T${timePart.replace(".", ":")}`;
};

// 5. Mengambil format panjang (contoh: 28 Juni 2026, 17.28) - Untuk Halaman Branch
export const formatLongDateTimeWIB = (dateInput: Date | string) => {
  const date = parseSafeDate(dateInput); // Tetap gunakan parseSafeDate agar kebal dari bug hilangnya huruf 'Z'
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};