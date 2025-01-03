import React, { useEffect, useState } from "react";
import { Loader, FileDown, XCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get("/riskData/history");
        setHistoryData(response.data.userHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const downloadPDF = async (fileId) => {
    // Set the downloading state for the specific fileId
    setDownloading((prev) => ({ ...prev, [fileId]: true }));

    try {
      const response = await axiosInstance.get(`/riskData/download/${fileId}`, {
        responseType: "blob",
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "RiskReport.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading((prev) => ({ ...prev, [fileId]: false }));
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
      <h1 className="text-2xl font-bold mb-6">History</h1>

      {historyData.length === 0 ? (
        <div className="flex flex-col items-center mt-20">
          <XCircle className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600 mt-4">No records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-200 px-4 py-2">Date</th>
                <th className="border border-gray-200 px-4 py-2">Diabetes Risk</th>
                <th className="border border-gray-200 px-4 py-2">Status</th>
                <th className="border border-gray-200 px-4 py-2">Uploaded Report</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {record.diabetesRisk || "N/A"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${record.status === "Cleared"
                          ? "bg-green-500"
                          : record.status === "Referred"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <button
                      onClick={() => downloadPDF(record._id)}
                      disabled={downloading[record._id]}
                      className={`flex items-center space-x-2 ${downloading[record._id]
                          ? "text-gray-400"
                          : "text-blue-500 hover:underline"
                        }`}
                    >
                      <FileDown className="w-4 h-4" />
                      <span>{downloading[record._id] ? "Downloading..." : "Download"}</span>
                    </button>
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

export default History;
