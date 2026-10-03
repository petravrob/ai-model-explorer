import useLogIn from "../../hooks/useLogin";
import { Button, LinkButton, Form, FormActions, FormField, PageContainer, PageMessage, PageTitle } from "@/ui";
import { ROUTE_PATHS } from "@/routes/paths";

/** Přihlášení uživatele. */
function LogIn() {
    const {
        formData,
        handleChange,
        handleSubmit,
    } = useLogIn();

    return (
        <PageContainer>
            <PageTitle centered>Přihlásit se</PageTitle>

            <Form onSubmit={handleSubmit}>
                <FormField label="Přezdívka" htmlFor="uname">
                    <input
                        id="uname"
                        name="uname"
                        type="text"
                        value={formData.uname}
                        onChange={handleChange}
                        required
                        placeholder="Vaše přezdívka"
                    />
                </FormField>

                <FormField label="Heslo" htmlFor="password">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </FormField>

                <FormActions>
                    <Button type="submit">
                        Přihlásit se
                    </Button>
                </FormActions>
            </Form>

            <PageMessage>
                Nemáte ještě účet?{" "}
                <LinkButton to={ROUTE_PATHS.signUp}>Registrovat se</LinkButton>
            </PageMessage>
        </PageContainer>
    );
}

export default LogIn;

