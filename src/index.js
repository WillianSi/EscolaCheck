import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { FirebaseProvider } from "./services/FirebaseProvider.js";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "assets/css/escola.css";

import Login from "views/Login/login.js";
import Register from "views/Login/register.js";
import Reset from "views/Login/passwordReset.js";

import AdminLayout from "layouts/Admin.js";
import Config from "views/Settings/config.js";
import Turmas from "views/Chamadas/turmas.js";
import Classes from "views/Turmas/classes.js";
import Help from "views/Help/ajuda.js";
import Student from "views/Alunos/student.js";
import List from "views/Alunos/chamada.js";
import Presence from "views/Chamadas/presence.js";
import Call from "views/Chamadas/call.js";
import CallFiq from "views/Chamadas/callFiq.js";
import EditCall from "views/Chamadas/editCall.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Rota para a página de login, inscrição e redefinição de senha */}
      <Route path="/*" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />

      {/* Rotas de administração*/}
      <Route
        path="/admin/*"
        element={
          <FirebaseProvider>
            <AdminLayout />
          </FirebaseProvider>
        }
      />
      <Route path="/admin/help" element={<Help />} />
      <Route path="/admin/cofig" element={<Config />} />
      <Route
        path="/admin/student"
        element={
          <FirebaseProvider>
            <Student />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <FirebaseProvider>
            <Classes />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/turmas"
        element={
          <FirebaseProvider>
            <Turmas />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/presence/:turmaId"
        element={
          <FirebaseProvider>
            <Presence />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/chamada/:turmaId"
        element={
          <FirebaseProvider>
            <List />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/call/:turmaId"
        element={
          <FirebaseProvider>
            <Call />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/callfiq/:turmaId"
        element={
          <FirebaseProvider>
            <CallFiq />
          </FirebaseProvider>
        }
      />
      <Route
        path="/admin/editcall/:turmaId/:presencaId"
        element={
          <FirebaseProvider>
            <EditCall />
          </FirebaseProvider>
        }
      />

      {/* Rota padrão redireciona para a página de login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
