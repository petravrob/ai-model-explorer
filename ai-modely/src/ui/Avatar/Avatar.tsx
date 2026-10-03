import "./Avatar.css";

interface AvatarProps {
    size?: "small" | "large";
}

/** Avatar uživatele. */
function Avatar({ size = "small" }: AvatarProps) {
    return (
        <span
            className={size === "large" ? "avatar avatar--large" : "avatar"}
            aria-hidden="true"
        ></span>
    );
}

export default Avatar;
