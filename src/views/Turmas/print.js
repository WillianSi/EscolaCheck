import React, { useRef, useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button, Table, Input } from "reactstrap";
import { FaFilePdf } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import loadingGif from "../../assets/img/brand/loading.gif";

import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

import jsPDF from "jspdf";
import "jspdf-autotable";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts;


const PrinTurma = (props) => {
  const { isOpen, toggle, uid } = props;
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const contentRef = useRef(null);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const loadingImgStyle = {
    width: "20px",
    height: "20px",
    marginRight: "5px",
  };

  const handleCheckboxChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handlePrint = async () => {
    try {
      setLoadingPrint(true);
      const selectedClassDocs = selectedClasses.map(classId => {
        const selectedClass = classes.find(cls => cls.id === classId);
        if (!selectedClass) return null;
        const alunosIds = selectedClass.alunos || [];
        const alunosNomes = alunosIds.map(alunoId => {
          const aluno = alunos.find(a => a.id === alunoId);
          return { id: alunoId, nome: aluno ? aluno.nome : "N/A" };
        });
        return {
          id: selectedClass.id,
          nome: selectedClass.nome,
          alunos: alunosNomes,
        };
      }).filter(Boolean);
      const printDocument = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>E.E Virginio Perillo Chamadas</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
            }
    
            h1, h2, li {
              margin-bottom: 2px;
            }
    
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
            }
    
            th, td {
              border: 1px solid #000;
              padding: 5px;
            }
    
            @media print {
              body {
                border: 1px solid #000;
                page-break-after: always;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h2>Lista de alunos:</h2>
          ${selectedClassDocs
            .map(
              classInfo => `
                <h3>${classInfo.nome}:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Alunos</th>
                      <th>Informações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${classInfo.alunos
                      .map(
                        alunoInfo => `
                          <tr>
                            <td>${alunoInfo.nome}</td>
                            <td></td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
            )
            .join("")}
        </body>
        </html>
      `;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(printDocument);
      iframe.contentDocument.close();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Error fetching/printing information");
    } finally {
      setLoadingPrint(false);
    }
  };

  const generatePDF = async () => {
    try {
      setLoadingPdf(true);
      const selectedClassDocs = selectedClasses.map(classId => {
        const selectedClass = classes.find(cls => cls.id === classId);
        if (!selectedClass) return null;
        const alunosIds = selectedClass.alunos || [];
        const alunosNomes = alunosIds.map(alunoId => {
          const aluno = alunos.find(a => a.id === alunoId);
          return { id: alunoId, nome: aluno ? aluno.nome : "N/A" };
        });
        alunosNomes.sort((a, b) => a.nome.localeCompare(b.nome));
        return {
          id: classId,
          nome: selectedClass.nome,
          alunos: alunosNomes,
        };
      }).filter(Boolean);
      const pdf = new jsPDF();
      selectedClassDocs.forEach(classDoc => {
        pdf.setFontSize(18);
        pdf.text(`E.E Virginio Perillo Chamada`, 14, 15);
        pdf.setFontSize(14);
        pdf.text(`Turma: ${classDoc.nome}`, 14, 25);
        const tableStartY = 35;
        pdf.autoTable({
          startY: tableStartY,
          head: [["Nome", "Informações"]],
          body: classDoc.alunos.map(aluno => [aluno.nome || "N/A", ""]),
          theme: "grid",
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 60 },
          },
        });
        pdf.addPage();
      });
      pdf.save("Turma_Alunos.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoadingPdf(false);
    }
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
        <div
          className="modal-body d-flex align-items-center justify-content-center"
          ref={contentRef}
        >
          <Table>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.nome}</td>
                  <td>
                    <Input
                      id={`checkbox_${classItem.id}`}
                      type="checkbox"
                      checked={selectedClasses.includes(classItem.id)}
                      onChange={() => handleCheckboxChange(classItem.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="modal-footer">
          <Button color="info" onClick={generatePDF} disabled={loadingPdf}>
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

export default PrinTurma;