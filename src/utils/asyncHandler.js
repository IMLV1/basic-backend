const asyncHandler = (fn) => { 
  return (req, res, next) => { 
    fn(req, res, next).catch(next); // หากเกิด Rejected Promise จะถูกโยนไปที่ Global Error Middleware ทันทีผ่าน next() 
  }; 
}; 
export default asyncHandler; 