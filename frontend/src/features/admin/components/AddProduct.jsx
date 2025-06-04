import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addProductAsync, resetProductAddStatus, selectProductAddStatus } from '../../products/ProductSlice';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { selectBrands } from '../../brands/BrandSlice';
import { selectCategories } from '../../categories/CategoriesSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

export const AddProduct = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const productAddStatus = useSelector(selectProductAddStatus);
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

  useEffect(() => {
    if (productAddStatus === 'fulfilled') {
      reset();
      toast.success("Sản phẩm mới đã được thêm");
      navigate("/admin/dashboard");
    } else if (productAddStatus === 'rejected') {
      toast.error("Có lỗi khi thêm sản phẩm, vui lòng thử lại sau");
    }
  }, [productAddStatus, reset, navigate]);

  useEffect(() => {
    return () => {
      dispatch(resetProductAddStatus());
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      imagesPreview.forEach(src => URL.revokeObjectURL(src));
    };
  }, [dispatch, thumbnailPreview, imagesPreview]);

  // Upload một file ảnh lên Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', response.data); // Debug
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý khi chọn file thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý khi chọn file images
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

  const handleAddProduct = async (data) => {
    try {
      setUploading(true);

      // Kiểm tra file thumbnail
      if (!thumbnailFile) {
        toast.error("Vui lòng chọn ảnh thumbnail");
        setUploading(false);
        return;
      }

      // Kiểm tra chính xác 4 file ảnh cho images
      if (imageFiles.length !== 4) {
        toast.error("Vui lòng chọn chính xác 4 ảnh cho sản phẩm");
        setUploading(false);
        return;
      }

      // Upload thumbnail
      const thumbnailUrl = await uploadImage(thumbnailFile);
      setThumbnailUrl(thumbnailUrl);

      // Upload images
      const uploadedImageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadImage(file);
        uploadedImageUrls.push(url);
      }
      setImagesUrls(uploadedImageUrls);

      // Tạo object sản phẩm với URL ảnh
      const newProduct = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        category: data.category,
        brand: data.brand,
        stockQuantity: Number(data.stockQuantity),
        thumbnail: thumbnailUrl,
        images: uploadedImageUrls
      };

      // Gửi dữ liệu JSON qua action
      console.log('Sending product:', newProduct); // Debug
      dispatch(addProductAsync(newProduct));
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.log(error);
      toast.error(error.message || "Có lỗi khi thêm sản phẩm, vui lòng thử lại");
    }
  };

  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
      <Stack 
        width={is1100 ? "100%" : "60rem"} 
        rowGap={4} 
        mt={is480 ? 4 : 6} 
        mb={6} 
        component={'form'} 
        noValidate 
        onSubmit={handleSubmit(handleAddProduct)}
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
              <Typography variant='h6' fontWeight={400} gutterBottom>Giảm giá {is480 ? "%" : "phần trăm"}</Typography>
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
                Vui lòng chọn chính xác 4 ảnh
              </Typography>
              <Stack direction="row" gap={2} flexWrap="wrap">
                {imagesPreview.map((src, index) => (
                  <img key={index} src={src} alt={`Image Preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480 ? 1 : 2}>
          <Button 
            variant="contained" 
            type="submit" 
            color="primary" 
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : 'Thêm sản phẩm'}
          </Button>
          <Button component={Link} to="/admin/dashboard" variant="outlined" color="secondary" disabled={uploading}>
            Hủy
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};