
 const mdns = require('multicast-dns')();

 const S_NAMESPACE = process.env.S_NAMESPACE || 'hzero_front_';
 
 const decodeData = (data) => {
   try {
     return JSON.parse(Buffer.from(data.toString(), 'base64').toString());
   } catch(e) {
     return null;
   }
 }
 
 mdns.on('response', function (response) {
    // console.log('got a response packet:', response)
    response.answers.forEach((ans) => {
      if (!ans.name.startsWith(`${S_NAMESPACE}-`)) {
        return;
      }
      const type = ans.name.replace(`${S_NAMESPACE}-`, '');
      const data = decodeData(ans.data[0])
      console.log('type: ', type);
      console.log('data: ', data);
    });
  });