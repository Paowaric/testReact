import { useState, type FormEvent } from "react";
import type { Employee } from "../App";

interface AddFormProps {
    insertEmployee: (employee: Employee) => void;
}

export default function AddForm({insertEmployee}:AddFormProps) {
    const [name, setName] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [salary, setSalary] = useState<number>(15000);

    function submitData(e:FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const newEmployee:Employee = {
            id:Math.floor(Math.random()*1000),
            firstname:name,
            lastname:lastname,
            salary:salary,
        }
        console.log("Submitting data:", newEmployee);
        insertEmployee(newEmployee);
        setName(""); 
        setLastname("");
        setSalary(15000);   
    }

  return (
    <>
      <form onSubmit={submitData}>
        <label>Employee Name</label>
        <input type="text" value={name} onChange={(e)=>setName(e.target.value)} />
        <label>Employee Lastname</label>
        <input type="text" value={lastname} onChange={(e)=>setLastname(e.target.value)} />
        <select value={salary} onChange={(e)=>setSalary(Number(e.target.value))}>
          <option>15000</option>
          <option>20000</option>
          <option>25000</option>
          <option>30000</option>
        </select>
        <button type="submit" disabled={name.trim()==="" || lastname.trim()===""}>Save</button>
      </form>
    </>
  );
}
