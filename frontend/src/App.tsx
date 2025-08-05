import { Routes, Route, BrowserRouter } from "react-router-dom";
import './App.css';
import Home from "./pages/Home";
import HomeNew from "./pages/HomeNew";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomeNew />} />
        <Route path='/old' element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
