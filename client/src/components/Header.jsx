import React from 'react'
import { assets } from '../assets/assets.js'
import { useContext } from 'react'
import { AppContext } from './context/AppContext.jsx'

const Header = () => {
  const {userData} = useContext(AppContext)
  return (
    <div className='flex flex-col items-center justify-center text-center mt-20 px-4 text-gray-800'>
        <img src={assets.header_img} alt="#"
        className='w-36 h-36 rounded-full mb-6' />
        <h1 className='flex items-center text-xl gap-2 sm:text-3xl font-medium  mb-2'>Hey {userData? userData.name : "Developer" }! <img src={assets.hand_wave} alt="#" className='w-8 aspect-square'/> </h1>
        <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our App</h2>
        <p className='text-gray-600 text-center max-w-md mb-8'>Let's start with a quick product tour and we will have you up and running in no time!</p>
        <button className='border cursor-pointer border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100'>Get Started</button>  
    </div>
  )
}

export default Header