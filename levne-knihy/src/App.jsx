import './App.css';
import Footer from './Components/Footer.jsx';
import Header from "./Components/Header.jsx"
import Main from "./Components/Main.jsx"

function App() {
  return (
    <div className="App">
      <div className='container'>
      <Header/>
      <Main/>
      </div>
      <Footer/>
    </div>
  );
}

export default App;