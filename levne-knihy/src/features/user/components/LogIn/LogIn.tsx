import "./Login.css";

import useLogIn from "../../hooks/useLogin";

/** Přihlášení uživatele. */
function LogIn() {
    const {
        formData,
        handleChange,
        handleSubmit,
    } = useLogIn();

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="uname">Přezdívka</label>
                    <input
                        id="uname"
                        name="uname"
                        type="text"
                        value={formData.uname}
                        onChange={handleChange}
                        required
                        placeholder="Vaše přezdívka"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password">Heslo</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn">
                        Přihlásit se
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LogIn;
