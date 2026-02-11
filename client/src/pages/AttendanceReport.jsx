import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';

const AttendanceReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Ensure this endpoint matches your Node.js backend route
        const { data } = await axios.get('/api/attendance/report', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load attendance data.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAttendance();
    }
  }, [token]);

  if (loading) return <div className="p-4 text-center">Loading report...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {report.length > 0 ? (
              report.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.subject}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport;