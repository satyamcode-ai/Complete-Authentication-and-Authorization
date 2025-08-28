import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  axios.defaults.withCredentials = true;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backend_url}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        // only show toast if user is logged in
        if (isLoggedIn) toast.error("Error fetching user data");
      }
    } catch (error) {
      if (isLoggedIn) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backend_url}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      
      const msg = error.response?.data?.message || error.message;
      if (msg !== "No token, authorization denied") {
        toast.error(msg);
      }
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backend_url,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
