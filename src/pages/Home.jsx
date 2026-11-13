import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <p className="subtitle">NASA SPACE APPS CHALLENGE 2026</p>

      <h1>
        ABANDONED
        <br />
        BUT <span>NOT FORGOTTEN</span>
      </h1>

      <p className="description">
        Discover the forgotten spacecraft and equipment
        that helped humanity explore the universe.
      </p>

      <button className="hero-button" onClick={() => navigate('/locations')}>
        Start Exploring →
      </button>
    </section>
  )
}

export default Home