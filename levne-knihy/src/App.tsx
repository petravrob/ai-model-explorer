import Footer from './components/layout/Footer.jsx';
import Header from "./components/layout/Header.jsx"
import Main from "./components/layout/Main.tsx"

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