import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar.tsx";
import Groups from "./pages/Groups.tsx";

function App() {

    const pages = ['Groups'];

    return (
        <BrowserRouter>
            <Navbar pages={pages} />
            <Routes>
                <Route path="/"/>
                <Route path="/groups" element={<Groups />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
