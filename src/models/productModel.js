import mongoose from 'mongoose'; 
const productSchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อสินค้า'], 
    trim: true, 
    unique: true 
  }, 
  price: { 
    type: Number, 
    required: [true, 'กรุณาระบุราคาสินค้า'], 
    min: [0, 'ราคาต้องไม่ติดลบ'] 
  }, 
  category: { 
    type: String, 
    required: [true, 'กรุณาระบุหมวดหมู่สินค้า'], 
    enum: { 
      values: ['Electronics', 'Books', 'Clothing', 'Home'], 
      message: 'หมวดหมู่สินค้าไม่ถูกต้อง' 
    } 
  }, 
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'ต้องระบุผู้ใช้งานที่เป็นคนสร้างสินค้า'] 
  } 
}, { 
  timestamps: true 
}); 
 
// เพิ่ม Index ให้กับฟิลด์ name และ category เพื่อให้ทำ Search และ Filter ได้เร็วขึ้น 
productSchema.index({ name: 1, category: 1 }); 
 
const Product = mongoose.model('Product', productSchema); 
export default Product; 