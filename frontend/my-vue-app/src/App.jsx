import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
  import TaskList from './components/TaskList';
 //import Navbar from './components/Navbar';
import AdminPage from './Pages/AdminPage';
import HomePage from './Pages/HomePage';
import Register from './Pages/Register';
import Login from './Pages/Login';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <div>
        {/* <Navbar /> */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/tasks" element={token ? <TaskList /> : <Login setToken={setToken} />} />
            <Route path="/admin" element={token ? <AdminPage /> : <Login setToken={setToken} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
