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

    // First try to hit the sales endpoint for crop 13
    // Assume crop 13 may not exist or might belong to someone else, but we will use the test crop we created which is ID 25.
    const res = await axios.post('http://localhost:8000/farmer/crops/25/sales', {
      buyer_type: "Mill",
      buyer_name: "ranga reddy cotton mill",
      buyer_id: "mill-3883",
      price_per_quintal: 6000,
      quantity_quintals: 25,
      total_bags: 50,
      bag_size: 50,
      payment_mode: "Cash",
      notes: "From harvests: First Picking",
      total_revenue: 150000,
      date: new Date().toISOString(),
      status: "listed"
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log("Sale Creation Success:", res.data);
  } catch (e) {
    if (e.response) {
      console.error('API Error:', e.response.status, JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('Network Error:', e.message);
    }
  }
}
test();
