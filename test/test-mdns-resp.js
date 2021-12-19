
 const mdns = require('multicast-dns')();

const S_NAMESPACE = process.env.S_NAMESPACE || 'hzero_front_';

const encodeData = (data) => {
  try {
    return `${Buffer.from(JSON.stringify(data)).toString('base64')}`;
  } catch {
    return null;
  }
}
const decodeData = (data) => {
  try {
    return JSON.parse(Buffer.from(data.toString(), 'base64').toString());
  } catch(e) {
    return null;
  }
}

 mdns.respond({
    answers: [
    {
      name: `${S_NAMESPACE}-offline`,
      type: 'TXT',
      data: encodeData({ip: '3.4.5.6'})
    }]
  });

  // mdns.query({
  //   questions:[{
  //     name: 'brunh33ilde.local',
  //     type: 'TXT'
  //   }]
  // })
  