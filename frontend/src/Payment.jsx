
// Payment.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const [bookingData, setBookingData] = useState(null);
  const [file, setFile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.booking) {
      setBookingData(location.state.booking);
    } else {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !bookingData || !bookingData._id) {
      alert('Please select a file and ensure booking data is complete.');
      return;
    }

    try {
      // Step 1: Upload to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', 'plinth'); // Replace with your Cloudinary preset

      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/da5i96ooe/image/upload', // Replace with your Cloudinary cloud name
        cloudinaryFormData
      );

      const proofImageUrl = cloudinaryResponse.data.secure_url; // Get the uploaded image URL

      // Step 2: Send to Backend
      const backendFormData = {
        bookingId: bookingData._id,
        proof: proofImageUrl, // Include the image URL in the payload
      };

      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/upload-proof`,
        backendFormData
      );

      // Step 3: Navigate to confirmation page
      navigate('/confirmation');
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof');
    }
  };

  if (!bookingData) return <p>Loading...</p>;

  const taxRate = 0.18;
  const taxes = bookingData.totalPrice * taxRate;
  const totalPriceWithTaxes = bookingData.totalPrice + taxes;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Payment Page</h2>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Booking Details</h3>
        
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">Field</th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Name:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">{bookingData.members[0].name}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>College:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">{bookingData.members[0].college}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Contact:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">{bookingData.members[0].contact}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Email:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">{bookingData.members[0].email}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Day Pass:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">{bookingData.dayPass}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Taxes (18%):</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">Rs {taxes.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-300"><strong>Total Price:</strong></td>
              <td className="py-2 px-4 border-b border-gray-300">Rs {totalPriceWithTaxes.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-800">Members:</h4>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md mt-2">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">S.No</th>
                <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">Member</th>
                <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">College</th>
                <th className="py-2 px-4 border-b-2 border-gray-300 text-left text-gray-600">Events</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.members.map((member, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 border-b border-gray-300">{idx + 1}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{member.name}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{member.college}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{member.events.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="my-6 text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Scan QR Code to Pay</h4>
        <img src="./qr-code.png" alt="QR Code for Payment" className="mx-auto w-40 h-40" />
        <p className="text-gray-700 mt-2 font-medium">LNMGYMKHANAFUND@SBI</p>
      </div>

      <form onSubmit={handleUpload}>
        <label htmlFor="proof" className="block text-gray-700 font-semibold mb-2">Upload Payment Proof</label>
        <input type="file" id="proof" onChange={handleFileChange} className="mb-4" required />
        
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Upload Proof
        </button>

        <p className="mt-2 text-sm text-gray-600 text-center">
          Please wait for 2-3 seconds after clicking "Upload Proof" for the process to complete.
        </p>
      </form>
      <p className="mt-4 font-semibold text-sm text-gray-700 text-center">
        If you have any issues regarding taxes or discounts, please contact Ayush Singh Chauhan at 9125466700.
      </p>
    </div>
  );
};

export default Payment;

