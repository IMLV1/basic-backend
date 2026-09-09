import jwt from 'jsonwebtoken'; 
import User from '../models/userModel.js'; 
import AppError from '../utils/appError.js'; 
import asyncHandler from '../utils/asyncHandler.js'; 
 
export const protect = asyncHandler(async (req, res, next) => { 
  let token; 
 
  // 1. ตรวจสอบว่ามี Bearer Token ส่งมาใน Header หรือไม่ 
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
    token = req.headers.authorization.split(' ')[1]; 
  } 
 
  if (!token) { 
    return next(new AppError('กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานสิทธิ์นี้', 401)); 
  } 
 
  // 2. ถอดรหัสและตรวจสอบลายเซ็นของ Token 
  let decoded; 
  try { 
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); 
  } catch (error) { 
    if (error.name === 'TokenExpiredError') { 
      return next(new AppError('เซสชันผู้ใช้หมดอายุแล้ว กรุณาอัปเดตโทเค็นใหม่', 401)); 
    } 
    return next(new AppError('ลายเซ็นไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 401)); 
  } 
 
  // 3. ตรวจสอบว่าผู้ใช้งานในโทเค็นนั้นยังคงมีตัวตนอยู่จริงในระบบหรือไม่ 
  const currentUser = await User.findById(decoded.id); 
  if (!currentUser) { 
    return next(new AppError('ไม่พบผู้ใช้งานที่เป็นของโทเค็นนี้ในระบบ', 401)); 
  } 
 
  // 4. ผูกข้อมูลผู้ใช้เข้าไปใน Request Object เพื่อให้ Controller ในขั้นต่อไปนำไปใช้งานได้ทันที 
  req.user = currentUser; 
  next(); 
}); 