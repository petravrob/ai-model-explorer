export const getAuthHeaders = (): HeadersInit => {
    const token = window.localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};
