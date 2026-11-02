
import axios from "axios";

export const BASE_URL_API = "https://sisgame-api.jf.ifsudestemg.edu.br";

export const api = axios.create({
    baseURL: BASE_URL_API,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    } else {
        config.headers.delete("Authorization");
    }

    return config;
});
