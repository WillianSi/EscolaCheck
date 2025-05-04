import React, { useState, useEffect } from "react";
import { HorizontalBar } from "react-chartjs-2";
import { Button} from "reactstrap";
import Table from "./table.js";
import TableMes from "./tableMes.js";
import { firestore } from "../../services/firebaseConfig.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import useFetchClasses from "../../hooks/class.js";

import {
  collection,
  getDocs,
} from "firebase/firestore";

const BarChart = () => {
  const { uid } = useFirebase();
  const { classes } = useFetchClasses(uid);
  const [barData, setBarData] = useState(null);

  const [table, setTable] = useState(false);
  const [tableMes, setTableMes] = useState(false);

  const updateBarData = (chartData) => {
    const blueColor = "#007BFF";
    const darkSlateBlue = "#483D8B";

    const presentDataset = {
      label: "Alunos presentes",
      backgroundColor: blueColor,
      hoverBackgroundColor: blueColor,
      data: chartData.map(
        (dataItem) => +dataItem.studentsPresentPercentage.toFixed(2)
      ),
    };

    const absentDataset = {
      label: "Alunos ausentes",
      backgroundColor: darkSlateBlue,
      hoverBackgroundColor: darkSlateBlue,
      data: chartData.map(
        (dataItem) => +dataItem.studentsAbsentPercentage.toFixed(2)
      ),
    };

    setBarData({
      labels: chartData.map((dataItem) => dataItem.classLabel),
      datasets: [presentDataset, absentDataset],
    });
  };

  useEffect(() => {
    const fetchDataForAllClasses = async () => {
      if (!classes.length) return;
      const chamadaRefs = classes.map((classItem) =>
        collection(firestore, `student/${uid}/turmas/${classItem.id}/chamada`)
      );
      const snapshots = await Promise.all(chamadaRefs.map(getDocs));
      const chartData = snapshots.map((chamadaSnapshot, index) => {
        const classItem = classes[index];
        const classLabel = classItem ? classItem.nome : "";
        const studentsPresentTotal = chamadaSnapshot.docs.reduce((total, doc) =>
          total + doc.data().studentsPresent.length, 0);
        const studentsAbsentTotal = chamadaSnapshot.docs.reduce((total, doc) =>
          total + doc.data().studentsAbsent.length, 0);
        const totalStudents = studentsPresentTotal + studentsAbsentTotal;
        const studentsPresentPercentage = (studentsPresentTotal / totalStudents) * 100;
        const studentsAbsentPercentage = (studentsAbsentTotal / totalStudents) * 100;
        return {
          classLabel,
          studentsPresentPercentage,
          studentsAbsentPercentage,
        };
      });
      updateBarData(chartData);
    };
    fetchDataForAllClasses();
  }, [classes, uid]);

  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: window.innerWidth > 768 ? 12 : 8,
          },
        },
      },
    },
  };

  const handleButtonClick = () => {
    toggleTable();
  };

  const toggleTable = () => {
    setTable((prev) => !prev);
  };

  const handleButtonC = () => {
    toggleTableMes();
  };

  const toggleTableMes = () => {
    setTableMes((prev) => !prev);
  };
  
  return (
    <>
      <AuthenticatedLayout>
        <div>
          <h2>Porcentagem por turma:</h2>
          {barData && <HorizontalBar data={barData} options={options} />}
        </div>
        <div className="button-container mt-3">
            <Button
              color="primary"
              className="mr-2 mb-2"
              onClick={handleButtonClick}
            >
              Frequência escolar anual
            </Button>
            <Button
              color="primary"
              className="mr-2 mb-2"
              onClick={handleButtonC}
            >
              Frequência escolar mensal
            </Button>
        </div>
        <Table
          uid={uid}
          isOpen={table}
          toggle={toggleTable}
        />
        <TableMes
          uid={uid}
          isOpen={tableMes}
          toggle={toggleTableMes}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default BarChart;