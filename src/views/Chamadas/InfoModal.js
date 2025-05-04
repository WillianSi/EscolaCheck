import React, { useState, useEffect } from "react";
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
import { firestore } from "services/firebaseConfig.js";
import { getDocs, collection } from "firebase/firestore";

const InfoModal = (props) => {
  const { isOpen, toggle, uid, turmaId } = props;
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [transferData, setTransferData] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const checkAndFetchTransferData = async () => {
        const trasferRef = collection(
          firestore,
          `student/${uid}/turmas/${turmaId}/trasfer`
        );
        try {
          const trasferSnapshot = await getDocs(trasferRef);

          if (trasferSnapshot.size > 0) {
            const transferDataArray = [];
            trasferSnapshot.forEach((doc) => {
              transferDataArray.push({
                id: doc.id,
                data: doc.data().dataNotFound,
              });
            });
            setTransferData(transferDataArray);
          }
        } catch (error) {
          console.error("Error checking 'trasfer' collection:", error);
        }
      };
      checkAndFetchTransferData();
    }
  }, [isOpen, uid, turmaId, setTransferData]);

  const generatePdf = () => {
    setLoadingPdf(true);
    const pdfDoc = new jsPDF();

    const tableHeaders = ["Data", "Nome", "Status"];
    const tableRows = [];

    transferData.forEach((item) =>
      item.data.forEach((data) => {
        const presentRows = data.alunosPresentDataArray.map((aluno) => [
          data.date,
          aluno.nome,
          "Presente",
        ]);
        const absentRows = data.alunosAbsentDataArray.map((aluno) => [
          data.date,
          aluno.nome,
          "Ausente",
        ]);

        tableRows.push(...presentRows, ...absentRows);
      })
    );
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
        0: { halign: "center" },
        1: { halign: "left" },
        2: { halign: "center" },
      },
    });

    pdfDoc.save("Relatorio_Anual.pdf");
    setLoadingPdf(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" width="auto">
      <ModalHeader toggle={toggle}>
        Informações de alunos transferidos
      </ModalHeader>
      <ModalBody>
        <h5>
          As informações presentes aqui referem-se a presenças de alunos
          transferidos, cujas datas não foram encontradas para realocar suas
          presenças nesta turma. Caso contrário, a presença deles estará marcada
          junto com as outras.
        </h5>
        {transferData.length > 0 ? (
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                </tr>
              </thead>
              <tbody>
                {transferData
                  .sort((a, b) =>
                    a.data[0].alunosPresentDataArray[0].nome.localeCompare(
                      b.data[0].alunosPresentDataArray[0].nome
                    )
                  )
                  .map((item) =>
                    item.data.map((data) => (
                      <tr key={`${item.id}-${data.date}`}>
                        <td>{data.date}</td>
                        <td>
                          {data.alunosPresentDataArray.map((aluno) => (
                            <div key={aluno.id}>
                              {aluno.nome} - Presente {aluno.observation}
                            </div>
                          ))}
                          {data.alunosAbsentDataArray.map((aluno) => (
                            <div key={aluno.id}>
                              {aluno.nome} - Ausente {aluno.observation}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </Table>
          </div>
        ) : (
          <p>Nenhum aluno encontrado.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={generatePdf} disabled={loadingPdf}>
          {loadingPdf ? (
            <img src={loadingGif} alt="Loading" className="loading-imgbut"/>
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