import React, { useState, useEffect } from "react";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import {
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import { auth } from "../../services/firebaseConfig.js";
import { useLocation, useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const [userEmail, setUserEmail] = useState("");
  const [, setUid] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const isHome = location.pathname === "/admin/index";

  const buttonStyle = {
    background: "transparent",
    border: "none",
    boxShadow: "none",
    padding: "0",
  };

  const mobileButtonStyle = {
    marginTop: "18px",
    marginLeft: "10px",
  };

  useEffect(() => {
    const cachedUserEmail = localStorage.getItem("cachedUserEmail");
    const cachedUid = localStorage.getItem("cachedUid");
    if (cachedUserEmail && cachedUid) {
      setUserEmail(cachedUserEmail);
      setUid(cachedUid);
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          const userEmail = user.email || "";
          const uid = user.uid || "";
          setUserEmail(userEmail);
          setUid(uid);
          localStorage.setItem("cachedUserEmail", userEmail);
          localStorage.setItem("cachedUid", uid);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleBackButtonClick = () => {
    if (location.pathname === "/admin/turmas") {
      navigate("/admin/index");
    }
    else {
      navigate(-1);
    }
  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          {!isHome && (
            <div>
              <Button
                color="info"
                onClick={handleBackButtonClick}
                style={{
                  ...buttonStyle,
                  ...mobileButtonStyle,
                }}
              >
                <FaRegArrowAltCircleLeft size={30} />
              </Button>
            </div>
          )}
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto"></Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={require("../../assets/img/brand/user.png")}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {userEmail}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
