import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EmployeeList from "./components/EmployeeList";
import AddForm from "./components/addForm";

export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  salary: number;
}

function App() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [data, setData] = useState<Employee[]>([
    { id: 1, firstname: "John", lastname: "Doe", salary: 50000 },
    { id: 2, firstname: "Jane", lastname: "Smith", salary: 60000 },
    { id: 3, firstname: "Alice", lastname: "Johnson", salary: 55000 },
  ]);

  function insertEmployee(employee: Employee) {
    setData([...data, employee]);
    console.log("Inserting employee:", employee);
  }

  function deleteEmployee(id: number) {
    const updatedData = data.filter((employee) => employee.id !== id);
    setData(updatedData);
    console.log("Deleting employee with id:", id);
  }

  return (
    <>
    <Header title="Employee Management System" />
      <AddForm insertEmployee={insertEmployee} />
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Hide" : "Show"}
      </button>
      <p>
        Have {data.length} {data.length > 1 ? "persons" : "person"}
      </p>
      {isVisible && <EmployeeList data={data} deleteEmployee={deleteEmployee} />}
      <hr />
      <Footer company="ABC Studio" year={2545} />
    </>
  );
}

export default App;
