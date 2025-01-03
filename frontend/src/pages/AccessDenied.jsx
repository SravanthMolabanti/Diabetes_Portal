import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({ userRole }) => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        if (userRole === "admin") {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="h-screen pt-20 px-6">
            <div style={{ textAlign: "center", marginTop: "20px" }}>

                <h1 className="text-3xl text-white mt-2">Access Denied</h1>
                <p className="text-xl text-white mt-2">You do not have permission to access this page.</p>
                <button onClick={handleRedirect} className="cursor-pointer bg-blue-400 text-white  mt-3 px-6 py-3 rounded-lg shadow-lg">
                    Go to Dashboard
                </button>

            </div>
        </div>
    );
};

export default AccessDenied;