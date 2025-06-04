import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductUpdateStatus,
  selectProductUpdateStatus,
  selectSelectedProduct,
  updateProductByIdAsync,
} from '../../products/ProductSlice';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { selectBrands } from '../../brands/BrandSlice';
import { selectCategories } from '../../categories/CategoriesSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

export const ProductUpdate = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { id } = useParams();
  const dispatch = useDispatch();
  const selectedProduct = useSelector(selectSelectedProduct);
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductByIdAsync(id));
  }, [id]);

  useEffect(() => {
    if (selectedProduct) {
      setThumbnailPreview(selectedProduct.thumbnail);
      setImagesPreview(selectedProduct.images || []);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (productUpdateStatus === 'fullfilled') {
      toast.success("Sản phẩm được sửa thành công");
      navigate("/admin/dashboard");
    } else if (productUpdateStatus === 'rejected') {
      toast.error("Lỗi sản phẩm được cập nhật, vui lòng thử lại");
    }
  }, [productUpdateStatus]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(resetProductUpdateStatus());
      if (thumbnailPreview && !thumbnailPreview.startsWith('http')) URL.revokeObjectURL(thumbnailPreview);
      imagesPreview.forEach(img => { if (!img.startsWith('http')) URL.revokeObjectURL(img); });
    };
  }, []);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post('http://localhost:8000/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 4) {
      toast.error("Vui lòng chọn chính xác 4 ảnh cho sản phẩm");
      setImageFiles([]);
      setImagesPreview([]);
      return;
    }
    setImageFiles(files);
    setImagesPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleProductUpdate = async (data) => {
    try {
      setUploading(true);

      let thumbnailUrl = selectedProduct.thumbnail;
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile);
      }

      let imageUrls = selectedProduct.images;
      if (imageFiles.length === 4) {
        imageUrls = [];
        for (const file of imageFiles) {
          const url = await uploadImage(file);
          imageUrls.push(url);
        }
      }

      const updatedProduct = {
        _id: selectedProduct._id,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        stockQuantity: Number(data.stockQuantity),
        thumbnail: thumbnailUrl,
        images: imageUrls,
        brand: data.brand,
        category: data.category,
      };

      dispatch(updateProductByIdAsync(updatedProduct));
    } catch (error) {
      toast.error("Có lỗi khi cập nhật sản phẩm");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
      {selectedProduct && (
        <Stack width={is1100 ? '100%' : '60rem'} rowGap={4} mt={is480 ? 4 : 6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleProductUpdate)}>
          {/* Form Fields */}
          <Stack rowGap={3}>
            <TextField label="Tiêu đề" defaultValue={selectedProduct.title} {...register('title', { required: 'Title is required' })} />

            <Stack flexDirection={'row'} gap={2}>
              <FormControl fullWidth>
                <InputLabel id="brand-selection">Thương hiệu</InputLabel>
                <Select defaultValue={selectedProduct.brand._id} {...register("brand", { required: true })} labelId="brand-selection" label="Brand">
                  {brands.map(brand => (
                    <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="category-selection">Danh mục</InputLabel>
                <Select defaultValue={selectedProduct.category._id} {...register("category", { required: true })} labelId="category-selection" label="Category">
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Miêu tả"
              multiline
              rows={4}
              defaultValue={selectedProduct.description}
              {...register('description', { required: 'Description is required' })}
            />

            <Stack flexDirection="row" gap={2}>
              <TextField
                type="number"
                label="Giá"
                defaultValue={selectedProduct.price}
                {...register('price', { required: 'Price is required' })}
              />
              <TextField
                type="number"
                label="Giảm giá %"
                defaultValue={selectedProduct.discountPercentage}
                {...register('discountPercentage', { required: 'Discount is required' })}
              />
            </Stack>

            <TextField
              label="Số lượng "
              type="number"
              defaultValue={selectedProduct.stockQuantity}
              {...register('stockQuantity', { required: 'Stock is required' })}
            />

            {/* Thumbnail */}
            <Stack>
              <Typography fontWeight={500}>Hình thu nhỏ</Typography>
              {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ width: '100px', margin: '8px 0' }} />}
              <input type="file" accept="image/*" onChange={handleThumbnailChange} />
            </Stack>

            {/* Product Images */}
            <Stack>
              <Typography fontWeight={500}>Ảnh sản phẩm (4 images)</Typography>
              <Stack direction="row" gap={2} flexWrap="wrap">
                {imagesPreview.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i}`} style={{ width: '100px', height: 'auto' }} />
                ))}
              </Stack>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </Stack>
          </Stack>

          {/* Buttons */}
          <Stack flexDirection={'row'} justifyContent="flex-end" columnGap={2}>
            <Button type="submit" variant="contained" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Cập nhật'}
            </Button>
            <Button variant="outlined" color="error" component={Link} to="/admin/dashboard">Hủy bỏ</Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
