/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  salary: number;
}

function App() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [person, setPerson] = useState<Employee>({
    id: 1,
    firstname: "",
    lastname: "",
    salary: 0,
  });

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>{isVisible ? "Hide" : "Show"}</button>
      {isVisible && (
        <div>
          <p>Employee ID: {person.id}</p>
          <p>Firstname: {person.firstname}</p>
          <p>Lastname: {person.lastname}</p>
          <p>Salary: {person.salary}</p>
          <button onClick={() =>setPerson(data=>({
            ...data,
            firstname: "John",
            lastname: "Doe",
            salary: 50000,
          }))}>Edit</button>
        </div>
      )}
      <hr />
    </>
  );
}

export default App;
