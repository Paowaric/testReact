import type { Employee } from "../App";

interface EmployeeListProps {
    data: Employee[]
    deleteEmployee: (id: number) => void
}

export default function EmployeeList({data,deleteEmployee}: EmployeeListProps) {
  return (
    <>
      <ul>
        {data.map((employee) => (
          <li key={employee.id}>
            Employee Name: {employee.firstname + " " + employee.lastname} |
            Salary: {employee.salary} Baths
            <button onClick={() => deleteEmployee(employee.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
