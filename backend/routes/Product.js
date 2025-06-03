const express=require('express')
const productController=require("../controllers/Product")
const router=express.Router()
const { upload }=require("../config/cloudinary")

router
    .post("/", upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]), productController.create)
    .get("/",productController.getAll)
    .get("/:id",productController.getById)
    .patch("/:id", upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]), productController.updateById)
    .patch("/undelete/:id",productController.undeleteById)
    .delete("/:id",productController.deleteById)
    
module.exports=router