import {FormHelperText, Stack, TextField, Typography,Box, useTheme, useMediaQuery} from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation} from '../../../assets'
import {useDispatch,useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser, signupAsync,selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig , motion} from 'framer-motion'

export const Signup = () => {
  const dispatch=useDispatch()
  const status=useSelector(selectSignupStatus)
  const error=useSelector(selectSignupError)
  const loggedInUser=useSelector(selectLoggedInUser)
  const {register,handleSubmit,reset,formState: { errors }} = useForm()
  const navigate=useNavigate()
  const theme=useTheme()
  const is900=useMediaQuery(theme.breakpoints.down(900))
  const is480=useMediaQuery(theme.breakpoints.down(480))

  // handles user redirection
  useEffect(()=>{
    if(loggedInUser && !loggedInUser?.isVerified){
      navigate("/verify-otp")
    }
    else if(loggedInUser){
      navigate("/")
    }
  },[loggedInUser])


  // handles signup error and toast them
  useEffect(()=>{
    if(error){
      toast.error(error.message)
    }
  },[error])

  
  useEffect(()=>{
    if(status==='fullfilled'){
      toast.success("Welcome! Verify your email to start shopping on mern-ecommerce.")
      reset()
    }
    return ()=>{
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  },[status])

  // this function handles signup and dispatches the signup action with credentails that api requires
  const handleSignup=(data)=>{
    const cred={...data}
    delete cred.confirmPassword
    dispatch(signupAsync(cred))
  }

  return (
    <Stack width={'100vw'} height={'100vh'} flexDirection={'row'} sx={{overflowY:"hidden"}}>

      {
        !is900 &&

        <Stack bgcolor={'black'} flex={1} justifyContent={'center'} >
          <Lottie animationData={ecommerceOutlookAnimation}/>
        </Stack>
        
        }

        <Stack flex={1} justifyContent={'center'} alignItems={'center'}>

              <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                  <Stack rowGap={'.4rem'}>
                    <Typography variant='h2' sx={{wordBreak:"break-word"}} fontWeight={600}>Mern Shop</Typography>
                    <Typography alignSelf={'flex-end'} color={'GrayText'} variant='body2'>- Shop Anything</Typography>
                  </Stack>

              </Stack>

                <Stack mt={4} spacing={2} width={is480?"95vw":'28rem'} component={'form'} noValidate onSubmit={handleSubmit(handleSignup)}>

                    <MotionConfig whileHover={{y:-5}}>

                      <motion.div>
                        <TextField fullWidth {...register("name",{required:"Nhập họ và tên"})} placeholder='Họ và tên'/>
                        {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
                      </motion.div>

                      <motion.div>
                        <TextField fullWidth {...register("email",{required:"Email là bắt buộc",pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,message:"Nhập email mới"}})} placeholder='Email'/>
                        {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
                      </motion.div>

                      <motion.div>
                        <TextField type='password' fullWidth {...register("password",{required:"Mật khẩu là bắt buộc",pattern:{value:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,message:`at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters`}})} placeholder='Mật khẩu'/>
                        {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
                      </motion.div>
                      
                      <motion.div>
                        <TextField type='password' fullWidth {...register("confirmPassword",{required:"Nhập lại mật khẩu mới",validate:(value,fromValues)=>value===fromValues.password || "Mật khẩu không trùng khớp"})} placeholder='Nhập lại mật khẩu mới'/>
                        {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
                      </motion.div>
                    
                    </MotionConfig>

                    <motion.div whileHover={{scale:1.020}} whileTap={{scale:1}}>
                      <LoadingButton sx={{height:'2.5rem'}} fullWidth loading={status==='pending'} type='submit' variant='contained'>Đăng nhập</LoadingButton>
                    </motion.div>

                    <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>
                        <MotionConfig whileHover={{x:2}} whileTap={{scale:1.050}}>
                            <motion.div>
                                <Typography mr={'1.5rem'} sx={{textDecoration:"none",color:"text.primary"}} to={'/forgot-password'} component={Link}>Quên mật khẩu</Typography>
                            </motion.div>

                            <motion.div>
                                <Typography sx={{textDecoration:"none",color:"text.primary"}} to={'/login'} component={Link}>Bạn đã là thành viên? <span style={{color:theme.palette.primary.dark}}>Đăng nhập</span></Typography>
                            </motion.div>
                        </MotionConfig>
                    </Stack>

                </Stack>


        </Stack>
    </Stack>
  )
}
