import Product from '../models/productModel.js'; 
import AppError from '../utils/appError.js'; 
import asyncHandler from '../utils/asyncHandler.js'; 
 
// --- โครงสร้างระบบ In-Memory Cache ฝั่งเซิร์ฟเวอร์ --- 
const localCache = { 
  data: null, 
  expiredAt: null 
}; 
 
// 1. ดึงรายการสินค้าทั้งหมด (พร้อมประยุกต์ทำ Caching) 
export const getAllProducts = asyncHandler(async (req, res, next) => { 
  const startTime = Date.now(); 
  const now = Date.now(); 
 
  // ตรวจสอบว่าใน Cache มีข้อมูลอยู่ และยังไม่หมดอายุ (Cache Hit) 
  if (localCache.data && localCache.expiredAt > now) { 
    const responseTime = Date.now() - startTime; 
    console.log(`[Cache System] Cache HIT! Response Time: ${responseTime}ms`); 
     
    res.setHeader('X-Cache-Status', 'HIT'); 
    res.setHeader('X-Response-Time', `${responseTime}ms`); 
    return res.status(200).json({ 
      status: 'success', 
      source: 'In-Memory Server-Side Cache', 
      results: localCache.data.length, 
      data: { products: localCache.data } 
    }); 
  } 
 
  // กรณีไม่พบบันทึกในแคช หรือแคชหมดอายุ (Cache Miss) 
  console.log('[Cache System] Cache MISS. Querying MongoDB...'); 
  const products = await Product.find().populate('createdBy', 'name email'); 
 
  // บันทึกผลลงใน In-Memory Cache พร้อมตั้งเวลา TTL ไว้ 15 วินาที 
  localCache.data = products; 
  localCache.expiredAt = Date.now() + 15 * 1000; // 15 วินาที 
 
  const responseTime = Date.now() - startTime; 
  res.setHeader('X-Cache-Status', 'MISS'); 
  res.setHeader('X-Response-Time', `${responseTime}ms`); 
 
  res.status(200).json({ 
    status: 'success', 
    source: 'MongoDB Database', 
    results: products.length, 
    data: { products } 
  }); 
}); 
 
// 2. เพิ่มสินค้าใหม่ (มีสิทธิ์เฉพาะคนที่ล็อกอินแล้ว) 
export const createProduct = asyncHandler(async (req, res, next) => { 
  const { name, price, category } = req.body; 
 
  const newProduct = await Product.create({ 
    name, 
    price, 
    category, 
    createdBy: req.user._id // ดึงตัวตนจากตัวแปร req.user ที่ผูกไว้จากมิดเดิลแวร์คัดกรอง 
  }); 
 
  // ล้างค่าข้อมูลแคชทันทีที่มีการเปลี่ยนแปลงข้อมูลในระบบ (Cache Invalidation) 
  // เพื่อป้องกันสภาวะข้อมูลในแคชไม่ตรงกับฐานข้อมูลจริง (Cache Inconsistency) 
  localCache.data = null; 
  localCache.expiredAt = null; 
 
  res.status(201).json({ 
    status: 'success', 
    message: 'เพิ่มสินค้าสำเร็จ', 
    data: { product: newProduct } 
  }); 
}); 
 
// 3. ดึงสินค้าตามไอดีเฉพาะเจาะจง 
export const getProductById = asyncHandler(async (req, res, next) => { 
  const product = await Product.findById(req.params.id).populate('createdBy', 'name email'); 
 
  if (!product) { 
    return next(new AppError('ไม่พบสินค้าที่ต้องการค้นหาตามรหัสไอดีดังกล่าว', 404)); 
  } 
 
  res.status(200).json({ 
    status: 'success', 
    data: { product } 
  }); 
}); 
 
// 4. แก้ไขสินค้า 
export const updateProduct = asyncHandler(async (req, res, next) => { 
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
    new: true, // คืนออบเจกต์ตัวใหม่หลังทำการแก้ไขแล้ว 
    runValidators: true // สั่งให้ทวนกฎ Validation ตามสเปก Schema อีกครั้ง 
  }); 
 
  if (!product) { 
    return next(new AppError('ไม่พบข้อมูลสินค้ารหัสไอดีดังกล่าวที่จะทำการแก้ไข', 404)); 
  } 
 
  // ล้างประวัติแคชสินค้าทั้งหมด เนื่องจากโครงสร้างข้อมูลเปลี่ยน 
  localCache.data = null; 
  localCache.expiredAt = null; 
 
  res.status(200).json({ 
    status: 'success', 
    message: 'ปรับปรุงข้อมูลสินค้าเรียบร้อย', 
    data: { product } 
  }); 
}); 
 
// 5. ลบข้อมูลสินค้า 
export const deleteProduct = asyncHandler(async (req, res, next) => { 
  const product = await Product.findByIdAndDelete(req.params.id); 
 
  if (!product) { 
    return next(new AppError('ไม่พบข้อมูลสินค้ารหัสไอดีดังกล่าวเพื่อทำการลบ', 404)); 
  } 
 
  // ล้างประวัติแคชสินค้าทั้งหมด 
  localCache.data = null; 
  localCache.expiredAt = null; 
 
  res.status(204).json({ 
    status: 'success', 
    data: null 
  }); 
}); 