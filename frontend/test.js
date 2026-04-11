const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/crops/', {
      name: "Wheat",
      area: 2.0,
      season: "Kharif",
      variety: null,
      crop_type: "Other",
      sowing_date: "2026-04-09T00:00:00",
      expected_harvest_date: null,
      notes: null
    });
    console.log(res.data);
  } catch (e) {
    if (e.response) {
      console.error('Status:', e.response.status);
      console.error('Data:', JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }
  }
}
test();
