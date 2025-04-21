import React, { createContext, useContext, useState } from "react";

const UserSignUpContext = createContext();

export const UserSignUpProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    dob: null,
    gender: '',
    phone: '',
    email: '',
    password: '',
    profilePicture: null,
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <UserSignUpContext.Provider value={{ formData, updateFormData }}>
      {children}
    </UserSignUpContext.Provider>
  );
};

export const useUserSignUp = () => useContext(UserSignUpContext);
