import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../components/context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { backend_url, setIsLoggedIn, getUserData} = useContext(AppContext)
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
  e.preventDefault()
  try {
    axios.defaults.withCredentials = true

    if (state === 'Sign Up') {
      const { data } = await axios.post(`${backend_url}/api/auth/register`, {
        name,
        email,
        password,
      })

      if (data.success) {
        setIsLoggedIn(true)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } else {
      // LOGIN FLOW
      const { data } = await axios.post(`${backend_url}/api/auth/login`, {
        email,
        password,
      })

      if (data.success) {
        setIsLoggedIn(true)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    }
  } catch (error) {
    console.error(error)
    toast.error(error.response?.data?.message || 'Something went wrong!')
  }
}

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-400 to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='logo'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='w-full sm:w-96 shadow-lg bg-slate-900 rounded-lg p-10 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>

        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up'
            ? 'Create your account'
            : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler}>
          {/* Full Name */}
          {state === 'Sign Up' && (
            <div className='flex w-full items-center gap-3 border border-gray-400 rounded-full px-4 py-2 mb-4 bg-[#333A5C]'>
              <img src={assets.person_icon} alt='person' />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='bg-transparent outline-none w-full'
                type='text'
                placeholder='Full Name'
                required
              />
            </div>
          )}

          {/* Email */}
          <div className='flex w-full items-center gap-3 border border-gray-400 rounded-full px-4 py-2 mb-4 bg-[#333A5C]'>
            <img src={assets.mail_icon} alt='mail' />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none w-full'
              type='email'
              placeholder='Email id'
              required
            />
          </div>

          {/* Password */}
          <div className='flex w-full items-center gap-3 border border-gray-400 rounded-full px-4 py-2 mb-4 bg-[#333A5C]'>
            <img src={assets.lock_icon} alt='lock' />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none w-full'
              type='password'
              placeholder='Password'
              required
            />
          </div>

          <p
            onClick={() => navigate('/reset-password')}
            className='mb-4 text-indigo-500 cursor-pointer'
          >
            Forgot password?
          </p>

          <button
            type='submit'
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'
          >
            {state}
          </button>
        </form>

        {/* Toggle text */}
        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?{' '}
            <span
              className='text-blue-400 cursor-pointer underline'
              onClick={() => setState('Login')}
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an account?{' '}
            <span
              className='text-blue-400 cursor-pointer underline'
              onClick={() => setState('Sign Up')}
            >
              Signup
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
