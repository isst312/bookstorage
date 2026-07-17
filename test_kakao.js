const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://dapi.kakao.com/v3/search/book', {
      headers: { Authorization: `KakaoAK 68af2e8eeb15fa7115c39888ebdb5ada` },
      params: { query: '자바스크립트', size: 1 }
    });
    console.log(JSON.stringify(res.data.documents[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
