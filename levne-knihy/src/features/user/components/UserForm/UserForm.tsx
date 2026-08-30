import { UserFormProps } from "../../types";

/** Formulář pro úpravu nebo registraci údajů o uživateli. */
function UserForm({
    title,
    formData,
    handleChange,
    handleSubmit,
    submitText,
    showUsername = false,
    showPassword = false,
}: UserFormProps) {

    return (
        <div className="auth-wrapper">

            <div className="auth-inner">

                <form onSubmit={handleSubmit}>

                    <h2>
                        {title}
                    </h2>


                    {showUsername && (

                        <div className="mb-3">

                            <label htmlFor="uname">
                                Přezdívka
                            </label>

                            <input
                                id="uname"
                                name="uname"
                                type="text"
                                className="form-control"
                                value={formData.uname ?? ""}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    )}


                    {!showUsername && (

                        <div className="mb-3">

                            <label>
                                Přezdívku nelze změnit
                            </label>

                        </div>

                    )}


                    <div className="mb-3">

                        <label htmlFor="fname">
                            Jméno
                        </label>

                        <input
                            id="fname"
                            name="fname"
                            type="text"
                            className="form-control"
                            value={formData.fname}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="mb-3">

                        <label htmlFor="lname">
                            Příjmení
                        </label>

                        <input
                            id="lname"
                            name="lname"
                            type="text"
                            className="form-control"
                            value={formData.lname}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="mb-3">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="mb-3">

                        <label htmlFor="phone">
                            Telefon
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {showPassword && (

                        <div className="mb-3">

                            <label htmlFor="password">
                                Heslo
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-control"
                                value={formData.password ?? ""}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    )}


                    <div className="d-grid">

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {submitText}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default UserForm;