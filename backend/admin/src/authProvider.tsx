import { AuthProvider } from "react-admin";
import { trpc } from "./common";

const storage = "positif-admin";

export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    async login({ username, password }) {
        const r = await trpc.userLogin.mutate({username: username, password: password})
        if (!r) {
            throw new Error("Invalid credentials, please try again");
        }
        localStorage.setItem(storage, JSON.stringify(r));
    },
    // called when the user clicks on the logout button
    async logout() {
        localStorage.removeItem("positif-admin");
    },
    // called when the API returns an error
    async checkError({ status }: { status: number }) {
        if (status === 401 || status === 403) {
            localStorage.removeItem(storage);
            throw new Error("Session expired");
        }
    },
    // called when the user navigates to a new location, to check for authentication
    async checkAuth() {
        if (!localStorage.getItem(storage)) {
            throw new Error("Authentication required");
        }
    },
};