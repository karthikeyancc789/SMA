import axios from "axios";

const API_URL = "http://localhost:5000/api/attendance";

const markAttendance = async (sessionToken, location, deviceInfo) => {
  const response = await axios.post(`${API_URL}/mark`, {
    sessionToken,
    location,
    deviceInfo
  });

  return response.data;
};

export default {
  markAttendance
};
