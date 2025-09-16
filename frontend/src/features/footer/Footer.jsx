import { Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Stack } from '@mui/material'
import React from 'react'
import { QRCodePng, appStorePng, googlePlayPng ,facebookPng,instagramPng,twitterPng,linkedinPng} from '../../assets'
import SendIcon from '@mui/icons-material/Send';
import { MotionConfig, motion } from 'framer-motion';
import { Link } from 'react-router-dom';



export const Footer = () => {

    const theme=useTheme()
    const is700=useMediaQuery(theme.breakpoints.down(700))

    const labelStyles={
        fontWeight:300,
        cursor:'pointer'
    }

  return (
    <Stack sx={{backgroundColor:theme.palette.primary.main,paddingTop:"3rem",paddingLeft:is700?"1rem":"3rem",paddingRight:is700?"1rem":"3rem",paddingBottom:"1.5rem",rowGap:"5rem",color:theme.palette.primary.light,justifyContent:"space-around"}}>

            {/* upper */}
            <Stack flexDirection={'row'} rowGap={'1rem'} justifyContent={is700?"":'space-around'} flexWrap={'wrap'}>

                <Stack rowGap={'1rem'} padding={'1rem'}>
                    <Typography variant='h6' fontSize={'1.5rem'}>Đặc Quyền</Typography>
                    <Typography variant='h6'>Đăng ký</Typography>
                    <Typography sx={labelStyles}>Nhận 10% giảm giá cho đơn hàng đầu tiên của bạn</Typography>
                    <TextField placeholder='Nhập email của bạn' sx={{border:'1px solid white',borderRadius:"6px"}} InputProps={{endAdornment:<IconButton><SendIcon sx={{color:theme.palette.primary.light}}/></IconButton>,style:{color:"whitesmoke"}}}/>
                </Stack>

                <Stack rowGap={'1rem'} padding={'1rem'}>
                    <Typography variant='h6'>Hỗ Trợ</Typography>
                    <Typography sx={labelStyles}>Trung Thanh Hữu Hòa Thanh Trì Hà Nội</Typography>
                    <Typography sx={labelStyles}>nguyentachinh2003@gmail.com</Typography>
                    <Typography sx={labelStyles}>0353611084</Typography>
                </Stack>

                <Stack rowGap={'1rem'} padding={'1rem'}>
                    <Typography  variant='h6'>Tài Khoản</Typography>
                    <Typography sx={labelStyles}>Tài Khoản Của Tôi</Typography>
                    <Typography sx={labelStyles}>Đăng Nhập / Đăng Ký</Typography>
                    <Typography sx={labelStyles}>Giỏ Hàng</Typography>
                    <Typography sx={labelStyles}>Danh Sách Yêu Thích</Typography>
                    <Typography sx={labelStyles}>Cửa Hàng</Typography>
                </Stack>

                <Stack rowGap={'1rem'} padding={'1rem'}>
                    <Typography  variant='h6'>Liên Kết Nhanh</Typography>
                    <Typography sx={labelStyles}>Chính Sách Bảo Mật</Typography>
                    <Typography sx={labelStyles}>Điều Khoản Sử Dụng</Typography>
                    <Typography sx={labelStyles}>Câu Hỏi Thường Gặp</Typography>
                    <Typography sx={labelStyles}>Liên Hệ</Typography>
                </Stack>

                <Stack rowGap={'1rem'} padding={'1rem'}>
                    <Typography  variant='h6'>Tải Ứng Dụng</Typography>
                    <Typography sx={{...labelStyles,color:"graytext",fontWeight:500}}>Tiết kiệm 58000Đ cho người dùng mới chỉ với ứng dụng</Typography>
                    <Stack flexDirection={'row'} columnGap={'.5rem'}>

                        <Box width={'100px'} height={"100px"}>
                            <img src={QRCodePng} height={'100%'} width={'100%'} style={{objectFit:'contain'}} alt="QR Code"/>
                        </Box>

                        <Stack justifyContent={'space-around'}>
                            <Stack>
                                <img style={{width:"100%",height:"100%",cursor:"pointer"}} src={googlePlayPng} alt="GooglePlay" />
                            </Stack>
                            <Stack>
                                <img style={{width:"100%",height:'100%',cursor:"pointer"}} src={appStorePng} alt="AppStore" />
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack mt={.6} flexDirection={'row'} columnGap={'2rem'}>
                        <MotionConfig whileHover={{scale:1.1}} whileTap={{scale:1}}>
                            <motion.img style={{cursor:"pointer"}} src={facebookPng} alt="Facebook" />
                            <motion.img style={{cursor:"pointer"}} src={twitterPng} alt="Twitter" />
                            <motion.img style={{cursor:"pointer"}} src={instagramPng} alt="Instagram" />
                            <motion.img style={{cursor:"pointer"}} src={linkedinPng} alt="Linkedin" />
                        </MotionConfig>
                    </Stack>
                </Stack>

            </Stack>

            {/* lower */}
            <Stack alignSelf={"center"}>
                <Typography color={'GrayText'}>&copy; Chính Store {new Date().getFullYear()}. Tất cả quyền được bảo lưu</Typography>
            </Stack>

    </Stack>
  )
}
