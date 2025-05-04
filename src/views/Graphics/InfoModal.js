import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Button,
} from "reactstrap";

import loadingGif from "../../assets/img/brand/loading.gif";
import { FaFilePdf } from "react-icons/fa6";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InfoModal = ({ isOpen, toggle, allClassesData }) => {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const loadingImgStyle = {
    width: "20px",
    height: "20px",
    marginRight: "5px",
  };

  const uniqueMonths = allClassesData.reduce((months, classInfo) => {
    classInfo.dates.forEach((dateInfo) => {
      const month = new Date(dateInfo.date).getMonth() + 1;
      if (!months.includes(month)) {
        months.push(month);
      }
    });
    return months;
  }, []).sort((a, b) => a - b);

  function numeroParaNomeMes(numero) {
    const meses = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];

    if (numero >= 1 && numero <= 12) {
      return meses[numero - 1];
    } else {
      return "Mês inválido";
    }
  }

  const generatePdf = () => {
    setLoadingPdf(true);
    const pdfDoc = new jsPDF();

    allClassesData.forEach((classInfo, index) => {
      if (index > 0) {
        pdfDoc.addPage();
      }

      pdfDoc.text(classInfo.className, 14, 10);

      const sortedStudentsData = classInfo.studentsData
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));

      const tableHeaders = [
        "Aluno",
        ...uniqueMonths.map((month) => numeroParaNomeMes(month)),
        "Total P/F",
      ];

      const tableRows = sortedStudentsData.map((studentData) => {
        const rowData = [
          studentData.nome,
          ...uniqueMonths.map(
            (month) =>
              studentData.totalFaltasMes.find(
                (monthData) => monthData.mes === month
              )?.totalMes || 0
          ),
          `${studentData.porcentagemPresencas.toFixed(
            2
          )} / ${studentData.porcentagemFaltas.toFixed(2)} %`,
        ];
        return rowData;
      });

      autoTable(pdfDoc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 20,
        theme: "grid",
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "center" },
          2: { halign: "center" },
          3: { halign: "center" },
        },
      });
    });

    pdfDoc.save("Relatorio_Anual.pdf");
    setLoadingPdf(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" width="auto">
      <ModalHeader toggle={toggle}>Informações das Turmas</ModalHeader>
      <ModalBody>
        {allClassesData.map((classInfo) => {
          const sortedStudentsData = classInfo.studentsData
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome));

          return (
            <div key={classInfo.classId} className="table-container">
              <h5>{classInfo.className}</h5>
              <div className="table-scroll">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      {uniqueMonths.map((month) => (
                        <th key={month}>{`${numeroParaNomeMes(month)}`}</th>
                      ))}
                      <th>Total P/F</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudentsData.map((studentData) => (
                      <tr key={studentData.nome}>
                        <td>{studentData.nome}</td>
                        {uniqueMonths.map((month) => (
                          <td key={month}>
                            {studentData.totalFaltasMes.find(
                              (monthData) => monthData.mes === month
                            )?.totalMes || 0}
                          </td>
                        ))}
                        <td>{`${studentData.porcentagemPresencas.toFixed(
                          2
                        )} / ${studentData.porcentagemFaltas.toFixed(
                          2
                        )} %`}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          );
        })}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={generatePdf} disabled={loadingPdf}>
          {loadingPdf ? (
            <img src={loadingGif} alt="Loading" style={loadingImgStyle} />
          ) : (
            <FaFilePdf color="#ffff" size={20} className="mr-1" />
          )}
        </Button>
        <Button color="danger" onClick={toggle}>
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InfoModal;
