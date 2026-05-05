import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api"; // adjust path

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    
    useEffect(() => {
        const getAndSetUser = async () => {
            try {

                const token = localStorage.getItem("token")
            if (!token) {          
                setLoading(false)
                return
            }
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
              {loading ? (
    <main style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f4ff 0%, #eef2ff 50%, #f5f0ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
    }}>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Loading...</p>
    </main>
) : children}
        </AuthContext.Provider>
    )
}