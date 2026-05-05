import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
        const data = await login({ email, password })
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return true  
    } catch (err) {
        return false  
    } finally {
        setLoading(false)
    }
}

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            localStorage.setItem("token", data.token) 
            setUser(data.user)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            localStorage.removeItem("token")
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    

    return { user, loading, handleRegister, handleLogin, handleLogout }
}