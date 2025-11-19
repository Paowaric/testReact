import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";
import "./theme.css";
import { BrowserRouter } from "react-router-dom";
export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  salary: number;
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <>
      <BrowserRouter>
        <Layout>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
