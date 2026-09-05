import "./Footer.css";

function Footer() {

    return (
        <footer className="footer">

            <div className="footer__container">

                <div className="footer__info">

                    <p>
                        Tato webová stránka je studentský zápočtový
                        projekt Univerzity Hradec Králové, oboru
                        Aplikovaná informatika.
                    </p>

                    <p>
                        <a
                            href="https://www.uhk.cz/cs/fakulta-informatiky-a-managementu/prijimaci-zkousky/studijni-programy/softwarove-inzenyrstvi"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Softwarové inženýrství – UHK
                        </a>
                    </p>

                </div>


                <div className="footer__columns">

                    <div className="footer__section">

                        <h2>Autor</h2>

                        <p>Petra Vrobelová</p>
                        <p>Olomouc</p>

                    </div>


                    <div className="footer__section">

                        <h2>Kontakt</h2>

                        <p>
                            <a href="tel:+420608217180">
                                +420 608 217 180
                            </a>
                        </p>

                        <p>
                            <a href="mailto:petravrobelova98@gmail.com">
                                petravrobelova98@gmail.com
                            </a>
                        </p>

                    </div>


                    <div className="footer__section">

                        <h2>Další projekty a LinkedIn</h2>

                        <p>
                            <a
                                href="https://www.linkedin.com/in/petra-vrobelova/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                LinkedIn
                            </a>
                        </p>

                        <p>
                            <a
                                href="https://github.com/petravrobelova"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub
                            </a>
                        </p>

                    </div>


                    <div className="footer__section">

                        <h2>Technologie</h2>

                        <p>
                            Moderní responzivní webové aplikace navrhuji
                            s využitím HTML5, CSS3, Bootstrapu,
                            JavaScriptu (ES6) a Reactu.
                        </p>

                    </div>

                </div>


                <p className="footer__copyright">
                    © Petra Vrobelová 2022
                </p>

            </div>

        </footer>
    );
}


export default Footer;