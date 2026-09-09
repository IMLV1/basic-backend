import express from 'express'; 
import dotenv from 'dotenv'; 
import cookieParser from 'cookie-parser'; 
import connectDB from './config/db.js'; 
import authRouter from './routes/authRoutes.js'; 
import productRouter from './routes/productRoutes.js'; 
import globalErrorHandler from './middleware/errorMiddleware.js'; 
import AppError from './utils/appError.js'; 
 
// โหลดตั้งค่าสภาพแวดล้อม 
dotenv.config(); 
 
// เชื่อมต่อฐานข้อมูล 
connectDB(); 
 
const app = express(); 
 
// มิดเดิลแวร์พื้นฐาน 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // จำเป็นสำหรับการแกะข้อมูลคุกกี้ฝั่งไคลเอนต์ 
 
// ลงทะเบียนเส้นทางการประมวลผล (API Routes) 
app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/products', productRouter); 
 
// ดักจับกรณีผู้ใช้พยายามระบุเส้นทางที่ไม่มีจริงในระบบ (Fallback 404 Route) 
app.all('*', (req, res, next) => { 
  next(new AppError(`ไม่พบที่อยู่เว็บ '${req.originalUrl}' บนเซิร์ฟเวอร์นี้`, 404)); 
}); 
 
// ศูนย์รวมดักจับจัดการข้อผิดพลาดประมวลผล (Global Error Middleware) 
app.use(globalErrorHandler); 
 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
  console.log(`[System Server] Application running in '${process.env.NODE_ENV}' mode on port ${PORT}`); 
}); 