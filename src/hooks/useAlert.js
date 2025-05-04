import { useState } from 'react';

const useAlert = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [alertColor, setAlertColor] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleAlert = (message, color, title) => {
    setErrorMessage(message);
    setAlertColor(color);
    setAlertTitle(title);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  return { errorMessage, alertColor, alertTitle, showAlert, handleAlert };
};

export default useAlert;