export function isAdmin() {
    if (typeof window === "undefined") return false;
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "admin";
}