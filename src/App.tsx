import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Gallery from './components/Gallery'
import Products from './components/Products'
import HoursAndPolicies from './components/HoursAndPolicies'
import Booking from './components/Booking'
import Contact from './components/Contact'
import Footer from './components/Footer'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Products />
        <HoursAndPolicies />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
