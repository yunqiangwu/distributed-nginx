
 const mdns = require('multicast-dns')();

 mdns.respond({
    answers: [
    {
      name: 'brunh33ilde.local',
      // type: 'Adfsfs',
      type: 'TXT',
      data: Buffer.from([254, 0, 66])
    }]
  });
  