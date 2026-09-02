import { UserFormProps } from "../../types";
import { Button, Form, FormActions, FormField } from "../../../../ui";

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
        <Form onSubmit={handleSubmit} className="user-form">

            {showUsername ? (
                <FormField label="Přezdívka" htmlFor="uname">
                    <input
                        id="uname"
                        name="uname"
                        type="text"
                        value={formData.uname ?? ""}
                        onChange={handleChange}
                        required
                        placeholder="Vaše přezdívka"
                    />
                </FormField>
            ) : (
                <FormField label="Přezdívka">
                    <p className="form-readonly">{formData.uname}</p>
                </FormField>
            )}

            <FormField label="Jméno" htmlFor="fname">
                <input
                    id="fname"
                    name="fname"
                    type="text"
                    value={formData.fname}
                    onChange={handleChange}
                    required
                    placeholder="Jan"
                />
            </FormField>

            <FormField label="Příjmení" htmlFor="lname">
                <input
                    id="lname"
                    name="lname"
                    type="text"
                    value={formData.lname}
                    onChange={handleChange}
                    required
                    placeholder="Novák"
                />
            </FormField>

            <FormField label="Email" htmlFor="email">
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jan@email.cz"
                />
            </FormField>

            <FormField label="Telefon" htmlFor="phone">
                <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="777 123 456"
                />
            </FormField>

            {showPassword && (
                <FormField label="Heslo" htmlFor="password">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password ?? ""}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </FormField>
            )}

            <FormActions>
                <Button type="submit">
                    {submitText}
                </Button>
            </FormActions>
        </Form>
    );
}

export default UserForm;
