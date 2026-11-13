import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Locations from './pages/Locations'
import About from './pages/About'
import Chat from './components/Chat'

function App() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">NASA <span>ARCHIVE</span></h2>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/locations">Explore</NavLink>
          <NavLink to="/about">About</NavLink>
          
        </div>

        <button className="nav-button" onClick={() => navigate('/locations')}>
          Explore Now
        </button>
      </nav>

      <main>
        <Chat />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App