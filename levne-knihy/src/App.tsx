import Footer from './components/layout/Footer.tsx';
import Header from "./components/layout/Header.tsx"
import Main from "./components/layout/Main.tsx"
import "./App.css";

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