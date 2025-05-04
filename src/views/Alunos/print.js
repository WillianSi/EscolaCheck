import React, { useRef, useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button } from "reactstrap";
import { FaFilePdf } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import loadingGif from "../../assets/img/brand/loading.gif";

import jsPDF from "jspdf";
import "jspdf-autotable";

const Print = (props) => {
  const { isOpen, toggle, data } = props;
  const contentRef = useRef(null);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const loadingImgStyle = {
    width: "20px",
    height: "20px",
    marginRight: "5px",
  };

  const handlePrint = () => {
    setLoadingPrint(true);

    const sortedData = [...data].sort((a, b) => a.nome.localeCompare(b.nome));

    const printDocument = `
      <!DOCTYPE html>
        <head>
          <title>Relatório</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(item => `<tr><td>${item.nome}</td></tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;

    iframeDocument.open();
    iframeDocument.write(printDocument);
    iframeDocument.close();

    iframe.onload = function() {
        iframeWindow.print();
        setLoadingPrint(false);
        document.body.removeChild(iframe);
    };
};

  const handlePrintPDF = () => {
    setLoadingPdf(true);
    const pdf = new jsPDF();
    pdf.text("Relatório", 14, 20);
    const studentData = props.data;
    studentData.sort((a, b) => a.nome.localeCompare(b.nome));
    const headers = [["Nome"]];
    const tableData = studentData.map((item) => [item.nome]);
  
    pdf.autoTable({
      head: headers,
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
    });
    pdf.save("Lista_de_Alunos.pdf");
    setLoadingPdf(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Relatório"}</h2>
          <button className="close" onClick={toggle}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body" ref={contentRef}>
          Gerar uma lista com os nomes de todos os alunos cadastrados
        </div>
        <div className="modal-footer">
          <Button color="info" onClick={handlePrintPDF} disabled={loadingPdf}>
            {loadingPdf ? (
              <img src={loadingGif} alt="Loading" style={loadingImgStyle} />
            ) : (
              <FaFilePdf color="#ffff" size={20} className="mr-1" />
            )}
          </Button>
          <div className="print-button">
            <Button color="info" onClick={handlePrint} disabled={loadingPrint}>
              {loadingPrint ? (
                <img src={loadingGif} alt="Loading" style={loadingImgStyle} />
              ) : (
                <FiPrinter color="#ffff" size={20} className="mr-1" />
              )}
            </Button>
          </div>
          <Button color="danger" onClick={toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Print;