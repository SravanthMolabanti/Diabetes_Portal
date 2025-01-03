import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios'; // Assuming axiosInstance is defined in a separate file
import { Toaster, toast } from 'react-hot-toast';

const UserDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true); // Set loading state to true
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axiosInstance.post('/riskData/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setUploadStatus('Uploaded successfully');
        toast.success('File uploaded successfully!');
        setSelectedFile(null); // Clear the selected file
      }
    } catch (err) {
      setUploadStatus('Failed to upload');
      toast.error('Upload failed. Please try again');
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-white">Hey, User!</h2>
          <p className="text-xl text-white mt-2">
            Test your diabetes risk by uploading a file.
          </p>
        </div>
        <div className="flex justify-center items-center mb-6">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
          >
            Click here to upload
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {selectedFile && (
          <div className="text-center mb-6">
            <p className="text-lg text-white">
              Selected file: {selectedFile.name}
            </p>
          </div>
        )}
        <div className="text-center">
          <button
            onClick={handleFileUpload}
            className={`bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300 ${isUploading || !selectedFile
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-green-600'
              }`}
            disabled={isUploading || !selectedFile} // Disable button if loading or no file
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
        {uploadStatus && (
          <div className="text-center mt-4">
            <p
              className={`text-lg ${uploadStatus === 'Uploaded successfully'
                  ? 'text-green-600'
                  : 'text-red-600'
                }`}
            >
              {uploadStatus}
            </p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default UserDashboard;
