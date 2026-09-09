class AppError extends Error { 
  constructor(message, statusCode) { 
    super(message); 
    this.statusCode = statusCode; 
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; 
    this.isOperational = true; // ระบุว่าเป็นความผิดพลาดที่ระบบคาดเดาได้ (ไม่ใช่ bug ของผู้เขียนโปรแกรม) 
 
    Error.captureStackTrace(this, this.constructor); 
  } 
} 
 
export default AppError; 