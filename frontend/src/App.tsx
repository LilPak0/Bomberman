import { Routes, Route, BrowserRouter } from "react-router-dom";
import './App.css';
import HomeNew from "./pages/HomeNew";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomeNew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
