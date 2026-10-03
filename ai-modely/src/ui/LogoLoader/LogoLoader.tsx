import LogoBadge from "../LogoBadge/LogoBadge";

interface LogoLoaderProps {
    // Text, který se ohlásí čtečkám obrazovky (na stránce se nezobrazuje)
    label?: string;
}

/** Načítací animace s logem aplikace - značka se hýbe pořád (viz LogoBadge). */
function LogoLoader({ label = "Aktualizace modelů" }: LogoLoaderProps) {
    return <LogoBadge className="logo-loader" playing label={label} />;
}

export default LogoLoader;