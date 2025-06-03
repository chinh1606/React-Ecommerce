import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { clearSelectedProduct, fetchProductByIdAsync, resetProductUpdateStatus, selectProductUpdateStatus, selectSelectedProduct, selectProductStatus, updateProductByIdAsync } from '../../products/ProductSlice';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { selectBrands } from '../../brands/BrandSlice';
import { selectCategories } from '../../categories/CategoriesSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

export const ProductUpdate = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { id } = useParams();
  const dispatch = useDispatch();
  const selectedProduct = useSelector(selectSelectedProduct);
  const productStatus = useSelector(selectProductStatus);
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const productUpdateStatus = useSelector(selectProductUpdateStatus);
  const navigate = useNavigate();
  const theme = useTheme();
  const is1100 = useMediaQuery(theme.breakpoints.down(1100));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [imagesPreview, setImagesPreview] = useState([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imagesUrls, setImagesUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load dữ liệu sản phẩm
  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id));
    }
  }, [id, dispatch]);

  // Điền dữ liệu vào form
  useEffect(() => {
    if (selectedProduct) {
      setValue('title', selectedProduct.title);
      setValue('description', selectedProduct.description);
      setValue('price', selectedProduct.price);
      setValue('discountPercentage', selectedProduct.discountPercentage);
      setValue('category', selectedProduct.category?._id || '');
      setValue('brand', selectedProduct.brand?._id || '');
      setValue('stockQuantity', selectedProduct.stockQuantity);
      setThumbnailUrl(selectedProduct.thumbnail || '');
      setImagesUrls(selectedProduct.images || []);
      setThumbnailPreview(selectedProduct.thumbnail || '');
      setImagesPreview(selectedProduct.images || []);
    }
  }, [selectedProduct, setValue]);

  // Xử lý trạng thái cập nhật
  useEffect(() => {
    if (productUpdateStatus === 'fulfilled') {
      toast.success("Sản phẩm đã được cập nhật");
      navigate("/admin/dashboard");
    } else if (productUpdateStatus === 'rejected') {
      toast.error("Có lỗi khi cập nhật sản phẩm, vui lòng thử lại sau");
    }
  }, [productUpdateStatus, navigate]);

  // Hiển thị lỗi tải sản phẩm

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(resetProductUpdateStatus());
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      imagesPreview.forEach(src => {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      });
    };
  }, [dispatch, thumbnailPreview, imagesPreview]);

  // Upload ảnh
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', response.data);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý chọn file thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý chọn file images
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      toast.error("Vui lòng chọn chính xác 4 ảnh cho sản phẩm");
      setImageFiles([]);
      setImagesPreview([]);
      return;
    }
    if (files.length > 0) {
      setImageFiles(files);
      setImagesPreview(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleProductUpdate = async (data) => {
    try {
      setUploading(true);

      // Kiểm tra thumbnail
      let finalThumbnail = thumbnailUrl;
      if (thumbnailFile) {
        finalThumbnail = await uploadImage(thumbnailFile);
        setThumbnailUrl(finalThumbnail);
      }
      if (!finalThumbnail) {
        toast.error("Vui lòng chọn ảnh thumbnail hoặc giữ ảnh hiện tại");
        setUploading(false);
        return;
      }

      // Kiểm tra images
      let finalImages = imagesUrls;
      if (imageFiles.length > 0) {
        if (imageFiles.length !== 4) {
          toast.error("Vui lòng chọn chính xác 4 ảnh cho sản phẩm");
          setUploading(false);
          return;
        }
        const uploadedImageUrls = [];
        for (const file of imageFiles) {
          const url = await uploadImage(file);
          uploadedImageUrls.push(url);
        }
        finalImages = uploadedImageUrls;
        setImagesUrls(uploadedImageUrls);
      }
      if (finalImages.length !== 4) {
        toast.error("Vui lòng chọn chính xác 4 ảnh hoặc giữ ảnh hiện tại");
        setUploading(false);
        return;
      }

      // Tạo object cập nhật
      const productUpdate = {
        _id: selectedProduct._id,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        category: data.category,
        brand: data.brand,
        stockQuantity: Number(data.stockQuantity),
        thumbnail: finalThumbnail,
        images: finalImages
      };

      console.log('Sending updated product:', productUpdate);
      dispatch(updateProductByIdAsync(productUpdate));
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.log(error);
      toast.error(error.message || "Có lỗi khi cập nhật sản phẩm, vui lòng thử lại");
    }
  };

  // Xử lý trạng thái tải
  if (productStatus === 'loading' || !selectedProduct) {
    return (
      <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
        <Typography>Đang tải sản phẩm...</Typography>
      </Stack>
    );
  }

  if (productStatus === 'rejected') {
    return (
      <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
        <Button component={Link} to="/admin/dashboard" variant="outlined" sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Stack>
    );
  }

  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
      <Stack 
        width={is1100 ? "100%" : "60rem"} 
        rowGap={4} 
        mt={is480 ? 4 : 6} 
        mb={6} 
        component={'form'} 
        noValidate 
        onSubmit={handleSubmit(handleProductUpdate)}
      >
        <Stack rowGap={3}>
          <Stack>
            <Typography variant='h6' fontWeight={400} gutterBottom>Tiêu đề</Typography>
            <TextField 
              {...register("title", { required: 'Title is required' })} 
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Stack>

          <Stack flexDirection={'row'} gap={2}>
            <FormControl fullWidth>
              <InputLabel id="brand-selection">Thương hiệu</InputLabel>
              <Select 
                {...register("brand", { required: "Brand is required" })} 
                labelId="brand-selection" 
                label="Brand"
                error={!!errors.brand}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="category-selection">Danh mục</InputLabel>
              <Select 
                {...register("category", { required: "Category is required" })} 
                labelId="category-selection" 
                label="Category"
                error={!!errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack>
            <Typography variant='h6' fontWeight={400} gutterBottom>Miêu tả</Typography>
            <TextField 
              multiline 
              rows={4} 
              {...register("description", { required: "Description is required" })} 
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Stack>

          <Stack flexDirection={'row'} gap={2}>
            <Stack flex={1}>
              <Typography variant='h6' fontWeight={400} gutterBottom>Giá</Typography>
              <TextField 
                type='number' 
                {...register("price", { required: "Price is required" })} 
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </Stack>
            <Stack flex={1}>
              <Typography variant='h6' fontWeight={400} gutterBottom>Giảm giá {is480 ? "%" : "Percentage"}</Typography>
              <TextField 
                type='number' 
                {...register("discountPercentage", { required: "Discount percentage is required" })} 
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage?.message}
              />
            </Stack>
          </Stack>

          <Stack>
            <Typography variant='h6' fontWeight={400} gutterBottom>Số lượng cổ phần</Typography>
            <TextField 
              type='number' 
              {...register("stockQuantity", { required: "Stock Quantity is required" })} 
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity?.message}
            />
          </Stack>

          <Stack>
            <Typography variant='h6' fontWeight={400} gutterBottom>Hình thu nhỏ</Typography>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleThumbnailChange}
              style={{ padding: '8px 0' }}
            />
            {thumbnailPreview && (
              <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ maxWidth: '200px', maxHeight: '200px', margin: '8px 0' }} />
            )}
          </Stack>

          <Stack>
            <Typography variant='h6' fontWeight={400} gutterBottom>Ảnh sản phẩm (Chính xác 4 ảnh)</Typography>
            <Stack rowGap={2}>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleImagesChange}
                style={{ padding: '8px 0' }}
              />
              <Typography variant='body2' color="textSecondary">
                Vui lòng chọn chính xác 4 ảnh hoặc giữ ảnh hiện tại
              </Typography>
              <Stack direction="row" gap={2} flexWrap="wrap">
                {imagesPreview.map((src, index) => (
                  <img 
                    key={`${src}-${index}`} 
                    src={src} 
                    alt={`Image Preview ${index}`} 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480 ? 1 : 2}>
          <Button 
            size={is480 ? 'medium' : 'large'} 
            variant="contained" 
            type="submit" 
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : 'Cập nhật sản phẩm'}
          </Button>
          <Button 
            size={is480 ? 'medium' : 'large'} 
            variant="outlined" 
            color="error" 
            component={Link} 
            to="/admin/dashboard"
            disabled={uploading}
          >
            Hủy
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};