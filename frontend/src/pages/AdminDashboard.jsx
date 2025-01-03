import React, { useEffect, useState } from "react";
import { FileDown, Loader, Save, XCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const AdminDashboard = () => {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRiskData = async () => {
      try {
        const response = await axiosInstance.get("/riskData/all");
        setRiskData(response.data);
      } catch (error) {
        console.error("Error fetching risk data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRiskData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/riskData/status/${id}`, {
        status: newStatus,
      });
      setRiskData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, status: response.data.status } : item
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const downloadPDF = async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get(`/riskData/download/${fileId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "RiskReport.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen pt-20 px-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Hello, Admin!</h1>
      {riskData.length === 0 ? (
        <div className="flex flex-col items-center mt-20">
          <XCircle className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600 mt-4">No records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-200 px-4 py-2">User Name</th>
                <th className="border border-gray-200 px-4 py-2">Date</th>
                <th className="border border-gray-200 px-4 py-2">Diabetes Risk</th>
                <th className="border border-gray-200 px-4 py-2">Uploaded Report</th>
                <th className="border border-gray-200 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riskData.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    {record.userId?.fullName || "Unknown"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {record.diabetesRisk || "N/A"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <button
                      onClick={() => downloadPDF(record._id, record.fileName)}
                      className="flex items-center space-x-2 text-blue-500 hover:underline"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <select
                      value={record.status}
                      onChange={(e) => updateStatus(record._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Cleared">Cleared</option>
                      <option value="Referred">Referred</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
