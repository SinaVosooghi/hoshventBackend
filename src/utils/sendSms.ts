const qs = require('querystring');
const http = require('https');

const options = {
  method: 'POST',
  hostname: 'rest.payamak-panel.com',
  port: null,
  path: '/api/SendSMS/SendSMS',
  headers: {
    'cache-control': 'no-cache',
    'postman-token': '986f8677-6806-fd9c-62bf-5b7594a44066',
    'content-type': 'application/x-www-form-urlencoded',
  },
};

export const sendSMS = ({ to, message }) => {
  const req = http.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks);
    });
  });

  req.write(
    qs.stringify({
      username: '9120678932',
      password: 'R@sta7576',
      to,
      from: '300082155',
      text: message,
      isflash: 'false',
    }),
  );

  req.end();
};
