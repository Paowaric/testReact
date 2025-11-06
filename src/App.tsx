import { useState } from 'react'

function App() {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')

  return (
    <>
      <h1>Hello World!!</h1>
      <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder='First name' />
      <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder='Last name' />
      <p>Firstname: {firstname}</p>
      <p>Lastname: {lastname}</p>
    </>
  )
}

export default App
