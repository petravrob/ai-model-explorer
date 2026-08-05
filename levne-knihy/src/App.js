import './App.css';
import Footer from './Components/Footer';
import Header from "./Components/Header"
import Main from "./Components/Main"

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