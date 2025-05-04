import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Row } from "reactstrap";

const Auth = ({ children, corDeFundo }) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.body.style.backgroundColor = corDeFundo || "#D9D9D9";
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
      <div className="main-content" ref={mainContent}>
        <div className="py-7 py-lg-8 mb-2">
        </div>
        <Container className="mt--9 pb-4">
          <Row className="justify-content-center">{children}</Row>
        </Container>
      </div>
    </>
  );
};

export default Auth;