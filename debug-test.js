const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://xcancel.com/naval', {
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
}).then(res => {
  const $ = cheerio.load(res.data);
  const items = $('.timeline-item').length;
  const profileName = $('.profile-card-fullname').text().trim();
  console.log('Profile name:', profileName);
  console.log('Timeline items found:', items);
  console.log('Response length:', res.data.length);

  // Check for error panel
  const errorPanel = $('.error-panel').text();
  if (errorPanel) {
    console.log('Error panel:', errorPanel);
  }

  // Save to file
  require('fs').writeFileSync('/tmp/nitter_response.html', res.data);
  console.log('Response saved to /tmp/nitter_response.html');
}).catch(err => console.error('Error:', err.message));
