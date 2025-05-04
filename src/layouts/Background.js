import React from "react";
import { useLocation } from "react-router-dom";

const Auth = ({ children, corDeFundo }) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.body.style.backgroundColor = corDeFundo || "#d3d3d3";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [corDeFundo]);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  return (
    <>
      <div className="main-content" ref={mainContent}>{children}</div>
    </>
  );
};

export default Auth;