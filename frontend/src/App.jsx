import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtp from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword' 

function App() {
  const {userData,setUserData}=useContext(userDataContext)
  return (
   <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
      <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
      <Route path='/forgot-password'element={<ForgotPassword />}/>
      <Route path='/verify-otp'element={<VerifyOtp />} />
      <Route path='/reset-password'element={<ResetPassword />} />
   </Routes>
  )
}

export default App
