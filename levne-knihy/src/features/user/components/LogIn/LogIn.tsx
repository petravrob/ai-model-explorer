import "./Login.css";

import useLogIn from "../../hooks/useLogin";

/** Přihlášení uživatele (user name + password form). */
function LogIn() {

    const {
        formData,
        handleChange,
        handleSubmit,
    } = useLogIn();


    return (
        <div className="auth-wrapper">

            <div className="auth-inner">

                <form onSubmit={handleSubmit}>

                    <h2>
                        Přihlásit se
                    </h2>


                    <div className="mb-3">

                        <label htmlFor="uname">
                            Přezdívka
                        </label>

                        <input
                            id="uname"
                            name="uname"
                            type="text"
                            className="form-control"
                            value={formData.uname}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="mb-3">

                        <label htmlFor="password">
                            Heslo
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="d-grid">

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Přihlásit se
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default LogIn;
