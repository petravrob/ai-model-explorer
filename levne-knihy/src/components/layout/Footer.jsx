import '../../App.css';

function Footer() {
  return (
    <footer>
        <div className='container'>
        <div id="school-project-information" >
            <p>Tato webová stránka je studentský zápočtový projekt Univerzity Hradec Králové, oboru Aplikovaná informatika.
            </p>
            <p>
            <a href="https://www.uhk.cz/cs/fakulta-informatiky-a-managementu/prijimaci-zkousky/studijni-programy/softwarove-inzenyrstvi">
                https://www.uhk.cz/cs/fakulta-informatiky-a-managementu/prijimaci-zkousky/studijni-programy/softwarove-inzenyrstvi
            </a>
            </p>
        </div>
        <div id="autor-contact">
            <div className="autor-contact-section">
                <h2>Autor</h2>
                <p>Petra Vrobelová</p>
                <p>Olomouc</p>
            </div>
            <div className="autor-contact-section">
                <h2>Kontakt</h2>
                <p>
                    <a href='tel:+420608217180'>+420 608 217 180</a> 
                </p>
                <p>
                    <a href='mailto:petravrobelova98@gmail.com'>petravrobelova98@gmail.com</a>
                </p>
            </div>
            <div className="autor-contact-section">
                <h2>Další projekty a LinkedIn</h2>
                <p>
                    <a href="https://www.linkedin.com/in/petra-vrobelova/">LinkedIn</a>  
                </p>
                <p>
                    <a href="https://github.com/petravrobelova">GitHub</a>
                </p>
            </div>
            <div className="autor-contact-section">
                <h2>Technologie, které používám</h2>
                <p>Snažím se navrhovat a vytvářet pěkné moderní weby s respozivním designem (návrhy ve figmě) za použití HTML5, CSS3 (Bootstrap), JavaScriptu (ES6) a Reactu. </p>
            </div>
        </div> 
        <p id='copyright'>Copyright© Petra Vrobelová 2023</p>
        </div>  
    </footer>
  );
}

export default Footer;