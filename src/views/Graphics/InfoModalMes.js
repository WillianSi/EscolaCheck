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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);

  const clearInputs = () => {
    setStartDate("");
    setEndDate("");
  };

  const loadingImgStyle = {
    width: "20px",
    height: "20px",
    marginRight: "5px",
  };

  const dates =
    allClassesData[0]?.dates?.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ) || [];

  const filteredDates = dates.filter(
    (date) =>
      (!startDate || new Date(date.date) >= new Date(startDate)) &&
      (!endDate || new Date(date.date) <= new Date(endDate))
  );

  const isStudentAbsent = (studentName) => {
    const resultsByDate = {};

    allClassesData.forEach((classInfo) => {
      classInfo.dates.forEach((date) => {
        const isAbsent =
          date.studentsAbsent &&
          date.studentsAbsent.some((student) => student.nome === studentName);
        const result = {
          className: classInfo.className,
          date: date.date,
          isAbsent: isAbsent,
        };

        if (!resultsByDate[date.date]) {
          resultsByDate[date.date] = [result];
        } else {
          resultsByDate[date.date].push(result);
        }
      });
    });

    return resultsByDate;
  };

  const generatePdf = () => {
    setLoadingPdf(true);
    const pdfDoc = new jsPDF('landscape');

    const totalAbsences = {};
    allClassesData.forEach((classInfo) => {
      classInfo.studentsData.forEach((studentData) => {
        if (!totalAbsences.hasOwnProperty(studentData.nome)) {
          totalAbsences[studentData.nome] = 0;
        }
        filteredDates.forEach((date) => {
          const results = isStudentAbsent(studentData.nome)[date.date] || [];
          totalAbsences[studentData.nome] += results.filter(
            (result) => result.isAbsent
          ).length;
        });
      });
    });

    const datesGroups = chunkArray(filteredDates, 7);

    allClassesData.forEach((classInfo, index) => {
      classInfo.studentsData.sort((a, b) => a.nome.localeCompare(b.nome));

      datesGroups.forEach((dates, groupIndex) => {
        if (index > 0 || groupIndex > 0) {
          pdfDoc.addPage("landscape");
        }

        pdfDoc.setFontSize(14);
        pdfDoc.text(`Turma: ${classInfo.className}`, 14, 10);
        pdfDoc.setFontSize(11);

        const tableHeaders = [
          "Aluno",
          ...dates.map((date) =>
            new Date(date.date + "T00:00:00Z").toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })
          ),
          "Total",
        ];
        
        const tableRows = classInfo.studentsData.map((studentData) => {
          let totalAbsent = 0;

          const rowData = [
            studentData.nome,
            ...dates.map((date) => {
              const results =
                isStudentAbsent(studentData.nome)[date.date] || [];
              totalAbsent += results.filter((result) => result.isAbsent).length;
              return results
                .map((result) => (result.isAbsent ? "F" : "."))
                .join("\n");
            }),
            totalAbsences[studentData.nome],
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
    });

    pdfDoc.save("Relatorio_Mensal.pdf");
    setLoadingPdf(false);
  };

  function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" width="auto">
      <ModalHeader toggle={toggle}>Informações das Turmas</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center mb-2">
          <label htmlFor="dateInicial" className="mr-2">Data Inicial:</label>
          <input
            id="dateInicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control mr-2"
            style={{ width: "150px" }}
          />
        </div>
        <div className="d-flex align-items-center mb-3">
          <label htmlFor="dateFinal" className="mr-3">Data Final:</label>
          <input
            id="dateFinal"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control mr-2"
            style={{ width: "150px" }}
          />
        </div>

        {allClassesData.map((classInfo) => (
          <div key={classInfo.classId} className="table-container">
            <h5>{classInfo.className}</h5>
            <div className="table-scroll">
              <Table responsive>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    {filteredDates.map((date) => (
                      <th key={date.date}>
                        {new Date(date.date + "T00:00:00Z").toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}
                      </th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {classInfo.studentsData
                    .slice()
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((studentData) => {
                      let totalAbsent = 0;

                      return (
                        <tr key={studentData.nome}>
                          <td>{studentData.nome}</td>
                          {filteredDates.map((date) => {
                            const results =
                              isStudentAbsent(studentData.nome)[date.date] ||
                              [];
                            totalAbsent += results.filter(
                              (result) => result.isAbsent
                            ).length;

                            return (
                              <td key={date.date}>
                                {results.map((result, index) => (
                                  <span key={index}>
                                    {result.isAbsent ? "F" : "."}
                                    <br />
                                  </span>
                                ))}
                              </td>
                            );
                          })}
                          <td>{totalAbsent}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </div>
          </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={generatePdf} disabled={loadingPdf}>
          {loadingPdf ? (
            <img src={loadingGif} alt="Loading" style={loadingImgStyle} />
          ) : (
            <FaFilePdf color="#ffff" size={20} className="mr-1" />
          )}
        </Button>
        <Button
          color="danger"
          onClick={() => {
            toggle();
            clearInputs();
          }}
        >
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InfoModal;
