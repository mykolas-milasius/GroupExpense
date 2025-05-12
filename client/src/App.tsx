import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar.tsx";
import Groups from "./pages/Groups.tsx";
import GroupDetails from "./pages/GroupDetails.tsx";
import CreateTransaction from "./pages/CreateTransaction.tsx";

function App() {
    const pages = ['Groups'];

    return (
        <BrowserRouter>
            <Navbar pages={pages} />
            <Routes>
                <Route path="/"/>
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:id" element={<GroupDetails />} />
                <Route path="/groups/:id/transactions/new" element={<CreateTransaction />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;