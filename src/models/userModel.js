import mongoose from 'mongoose'; 
import bcrypt from 'bcrypt'; 
const userSchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: [true, 'กรุณากรอกชื่อผู้ใช้งาน'], 
    trim: true 
  }, 
  email: { 
    type: String, 
    required: [true, 'กรุณากรอกอีเมล'], 
    unique: true, 
    lowercase: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'รูปแบบอีเมลไม่ถูกต้อง'] 
  }, 
  password: { 
    type: String, 
    required: [true, 'กรุณากรอกรหัสผ่าน'], 
    minlength: [6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'], 
    select: false // เมื่อมีการ Query ปกติจะไม่ดึงฟิลด์นี้มาส่งออก เพื่อความปลอดภัย 
  } 
}, { 
  timestamps: true 
}); 
 
// Middleware ของ Mongoose: ดักจับเพื่อแฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล 
userSchema.pre('save', async function(next) { 
  if (!this.isModified('password')) return next(); 
  this.password = await bcrypt.hash(this.password, 12); 
  next(); 
}); 
 
// Method พิเศษสำหรับเอาไว้เปรียบเทียบรหัสผ่านในระดับ Model 
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) { 
  return await bcrypt.compare(candidatePassword, userPassword); 
}; 
 
const User = mongoose.model('User', userSchema); 
export default User; 