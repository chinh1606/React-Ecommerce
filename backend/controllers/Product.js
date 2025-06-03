const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")

exports.create = async (req, res) => {
  try {
    const { title, description, price, discountPercentage, category, brand, stockQuantity } = req.body;

    if (!title || !description || !price || !category || !brand || !stockQuantity || !req.files) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin và upload ít nhất một ảnh' });
    }

    const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].path : null;
    if (!thumbnail) {
      return res.status(400).json({ message: 'Vui lòng upload ảnh thumbnail' });
    }

    const images = req.files.images ? req.files.images.map(file => file.path) : [];
    if (images.length === 0) {
      return res.status(400).json({ message: 'Vui lòng upload ít nhất một ảnh cho images' });
    }

    const created = new Product({
      title,
      description,
      price,
      discountPercentage: discountPercentage || 0,
      category,
      brand,
      stockQuantity,
      thumbnail, 
      images,    
      isDeleted: false
    });

    await created.save();
    res.status(201).json(created);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error adding product, please try again later' });
  }
};

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category")
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, discountPercentage, category, brand, stockQuantity } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    if (product.isDeleted) {
      return res.status(400).json({ message: 'Sản phẩm đã bị xóa, vui lòng khôi phục trước' });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPercentage !== undefined) product.discountPercentage = discountPercentage;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stockQuantity) product.stockQuantity = stockQuantity;

    // Cập nhật thumbnail nếu có file mới
    if (req.files && req.files.thumbnail) {
      product.thumbnail = req.files.thumbnail[0].path;
    }

    if (req.files && req.files.images) {
      const newImages = req.files.images.map(file => file.path);
      product.images = newImages;
    }

    await product.save();
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error updating product, please try again later' });
  }
};

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}


