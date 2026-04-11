const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8000/auth/login', {
        email: 'test_farmer_12345@example.com',
        password: 'password123',
        role: 'farmer'
    });

    const token = loginRes.data.access_token;
    console.log("Logged in:", token.substring(0, 5) + "...");

    const res = await axios.post('http://localhost:8000/crops/', {
      name: "Wheat Test",
      area: 2.0,
      season: "Kharif",
      variety: null,
      crop_type: "Other",
      sowing_date: "2026-04-09T00:00:00",
      expected_harvest_date: null,
      notes: null
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log("Crop Creation Success:", res.data);
  } catch (e) {
    if (e.response) {
      console.error('API Error:', e.response.status, JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('Error:', e.message);
    }
  }
}
test();
