import jwt from 'jsonwebtoken'; 
import User from '../models/userModel.js'; 
import AppError from '../utils/appError.js'; 
import asyncHandler from '../utils/asyncHandler.js'; 
// ฟังก์ชันสร้างเหรียญ JWT 
const signAccessToken = (id) => { 
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { 
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN 
  }); 
}; 
 
const signRefreshToken = (id) => { 
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN 
  }); 
}; 
 
// 1. ลงทะเบียนผู้ใช้ 
export const register = asyncHandler(async (req, res, next) => { 
  const { name, email, password } = req.body; 
 
  const newUser = await User.create({ 
    name, 
    email, 
    password 
  }); 
 
  // ปิดความปลอดภัยรหัสผ่านไม่ให้สะท้อนกลับใน response 
  newUser.password = undefined; 
 
  res.status(201).json({ 
    status: 'success', 
    message: 'ลงทะเบียนผู้ใช้สำเร็จ', 
    data: { user: newUser } 
  }); 
}); 
 
// 2. ล็อกอินระบบ (Dual-token Strategy) 
export const login = asyncHandler(async (req, res, next) => { 
  const { email, password } = req.body; 
 
  // ตรวจสอบว่าส่งอีเมลและรหัสผ่านครบถ้วนหรือไม่ 
  if (!email || !password) { 
    return next(new AppError('กรุณากรอกอีเมลและรหัสผ่าน', 400)); 
  } 
 
  // ค้นหาผู้ใช้ตามอีเมล (ดึงฟิลด์รหัสผ่านด้วย .select('+password')) 
  const user = await User.findOne({ email }).select('+password'); 
 
  if (!user || !(await user.comparePassword(password, user.password))) { 
    return next(new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401)); 
  } 
 
  // ออก Access และ Refresh Token 
  const accessToken = signAccessToken(user._id); 
  const refreshToken = signRefreshToken(user._id); 
 
  // นำ Refresh Token ใส่ใน HTTP-Only Cookie เพื่อความปลอดภัย 
  const cookieOptions = { 
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // หมดอายุใน 7 วัน 
    httpOnly: true, // สกัดช่องทาง XSS ห้าม JavaScript ฝั่งไคลเอนต์เข้าถึง 
    secure: process.env.NODE_ENV === 'production', // บังคับวิ่งเฉพาะ HTTPS บนโปรดักชัน 
    sameSite: 'strict' // ป้องกันการโจมตีประเภท CSRF 
  }; 
 
  res.cookie('refreshToken', refreshToken, cookieOptions); 
 
  res.status(200).json({ 
    status: 'success', 
    message: 'เข้าสู่ระบบสำเร็จ', 
    accessToken, 
    data: { 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    } 
  }); 
}); 
 
// 3. ปล่อย Access Token ชุดใหม่โดยอ้างอิงจาก Refresh Token ในคุกกี้ (Silent Refresh) 
export const refresh = asyncHandler(async (req, res, next) => { 
  const { refreshToken } = req.cookies; 
 
  if (!refreshToken) { 
    return next(new AppError('ไม่พบโทเค็นอ้างอิงในการต่ออายุเซสชัน', 401)); 
  } 
 
  let decoded; 
  try { 
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); 
  } catch (error) { 
    return next(new AppError('โทเค็นอ้างอิงเพื่ออัปเดตหมดอายุหรือหมดสิทธิ์แล้ว กรุณาล็อกอินใหม่', 401)); 
  } 
 
  const currentUser = await User.findById(decoded.id); 
  if (!currentUser) { 
    return next(new AppError('ผู้ใช้อ้างอิงสำหรับโทเค็นนี้ไม่มีตัวตนแล้วในระบบ', 401)); 
  } 
 
  // ส่ง Access Token ตัวใหม่คืนไปทาง Body 
  const newAccessToken = signAccessToken(currentUser._id); 
 
  res.status(200).json({ 
    status: 'success', 
    accessToken: newAccessToken 
  }); 
}); 
 
// 4. ออกจากระบบ (ล้างคุกกี้ Refresh Token) 
export const logout = asyncHandler(async (req, res, next) => { 
  res.clearCookie('refreshToken', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  }); 
 
  res.status(200).json({ 
    status: 'success', 
    message: 'ออกจากระบบสำเร็จ' 
  }); 
}); 