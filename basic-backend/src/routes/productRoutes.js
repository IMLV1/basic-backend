import express from 'express'; 
import {  
  getAllProducts,  
  createProduct,  
  getProductById,  
  updateProduct,  
  deleteProduct  
} from '../controllers/productController.js'; 
import { protect } from '../middleware/authMiddleware.js'; 
 
const router = express.Router(); 
 
// ดึงข้อมูลสินค้า (สาธารณะ: ไม่ต้องเข้าสู่ระบบก็ดูได้) 
router.get('/', getAllProducts); 
router.get('/:id', getProductById); 
 
// ป้องกันและจำกัดสิทธิ์ Route ถัดลงไปจากนี้ทั้งหมด ต้องล็อกอินผ่าน token ก่อนเสมอ 
router.use(protect); 
 
router.post('/', createProduct); 
router.patch('/:id', updateProduct); 
router.delete('/:id', deleteProduct); 
 
export default router; 