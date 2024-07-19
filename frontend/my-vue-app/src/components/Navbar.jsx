 import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </header>
  );
};

export default Navbar;
