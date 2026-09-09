import AppError from '../utils/appError.js'; 

const sendErrorDev = (err, res) => { 
  res.status(err.statusCode).json({ 
    status: err.status, 
    error: err, 
    message: err.message, 
    stack: err.stack 
  }); 
}; 
 
const sendErrorProd = (err, res) => { 
  // หากเป็นความผิดพลาดประเภท Operational Error (เราดักจับเอง) คืนข้อความที่ผู้ใช้อ่านเข้าใจได้ทันที 
  if (err.isOperational) { 
    res.status(err.statusCode).json({ 
      status: err.status, 
      message: err.message 
    }); 
  } else { 
    // หากเป็น Bug ทางเทคนิค ให้ซ่อน Stack Trace จากผู้ใช้ เพื่อความมั่นคงปลอดภัย 
    console.error('[CRITICAL BUG ALERT]', err); 
    res.status(500).json({ 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ' 
    }); 
  } 
}; 
 
export default (err, req, res, next) => { 
  err.statusCode = err.statusCode || 500; 
  err.status = err.status || 'error'; 
 
  if (process.env.NODE_ENV === 'development') { 
    sendErrorDev(err, res); 
  } else { 
    // ปรับปรุงคลาสข้อผิดพลาดที่ส่งคืนจาก MongoDB/Mongoose ให้เป็นมาตรฐาน AppError 
    let error = { ...err }; 
    error.message = err.message; 
 
    // กรณี Mongoose Cast Error (เช่น ส่งรหัสไอดีผิดรูปแบบมา) 
    if (err.name === 'CastError') { 
      const message = `รูปแบบไอดีไม่ถูกต้อง: ${err.value}`; 
      error = new AppError(message, 400); 
    } 
 
    // กรณีข้อมูลลงทะเบียนซ้ำ (Duplicate Key error จาก MongoDB) 
    if (err.code === 11000) { 
      const value = Object.keys(err.keyValue)[0]; 
      const message = `ฟิลด์ '${value}' นี้ถูกใช้งานแล้วในระบบ กรุณากรอกค่าอื่น`; 
      error = new AppError(message, 400); 
    } 
 
    // กรณี Mongoose ValidationError (ข้อมูลไม่ผ่านกฎที่เขียนไว้ใน Schema) 
    if (err.name === 'ValidationError') { 
      const messages = Object.values(err.errors).map(el => el.message).join(', '); 
      error = new AppError(`ข้อมูลไม่ผ่านเกณฑ์ทดสอบ: ${messages}`, 400); 
    } 
 
    sendErrorProd(error, res); 
  } 
}; 