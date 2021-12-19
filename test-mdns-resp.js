
 const mdns = require('multicast-dns')();

 mdns.respond({
    answers: [
    {
      name: Buffer.from('brunh33ilde.loc--0-s3....23///\\al').toString('base64'),
      // type: 'Adfsfs',
      type: 'TXT',
      data: Buffer.from([254, 0, 66])
    }]
  });

  // mdns.query({
  //   questions:[{
  //     name: 'brunh33ilde.local',
  //     type: 'TXT'
  //   }]
  // })
  