import "./UserForm.css";

import { UserFormProps } from "../../types";

/** Formulář pro úpravu nebo registraci údajů o uživateli. */
function UserForm({
    formData,
    handleChange,
    handleSubmit,
    submitText,
    showUsername = false,
    showPassword = false,
}: UserFormProps) {

    return (
        <div className="user-form-page">

            <form className="book-form" onSubmit={handleSubmit}>

                {showUsername ? (
                    <div className="form-field">
                        <label htmlFor="uname">Přezdívka</label>
                        <input
                            id="uname"
                            name="uname"
                            type="text"
                            value={formData.uname ?? ""}
                            onChange={handleChange}
                            required
                            placeholder="Vaše přezdívka"
                        />
                    </div>
                ) : (
                    <div className="form-field">
                        <label>Přezdívka</label>
                        <p className="form-readonly">{formData.uname}</p>
                    </div>
                )}

                <div className="form-field">
                    <label htmlFor="fname">Jméno</label>
                    <input
                        id="fname"
                        name="fname"
                        type="text"
                        value={formData.fname}
                        onChange={handleChange}
                        required
                        placeholder="Jan"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="lname">Příjmení</label>
                    <input
                        id="lname"
                        name="lname"
                        type="text"
                        value={formData.lname}
                        onChange={handleChange}
                        required
                        placeholder="Novák"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jan@email.cz"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="777 123 456"
                    />
                </div>

                {showPassword && (
                    <div className="form-field">
                        <label htmlFor="password">Heslo</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password ?? ""}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn">
                        {submitText}
                    </button>
                </div>

            </form>

        </div>
    );
}


export default UserForm;
