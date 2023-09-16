import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import {publicIp, publicIpv4, publicIpv6} from 'public-ip';
let ovh = require('ovh')({
    endpoint: 'ovh-eu',
    appKey: '',
    appSecret: '',
    consumerKey: ''
  });

  async function main() {
    try {
      let myip = await publicIpv4();
  
      ovh.request('GET', '/domain/zone', async function (error, dom) {
        if (error) console.log(error);
  
        for (const element of dom) {
          ovh.request('GET', '/domain/zone/' + element + '/record/', async function (error, dom2) {
            if (error) console.log(error);
            for (const record of dom2) {
              ovh.request('GET', '/domain/zone/' + element + '/record/' + record, async function (error, dom3) {
                if (dom3.target !== myip && dom3.fieldType === 'A') {
                  ovh.request('PUT', '/domain/zone/' + element + '/record/' + record, {
                    target: myip,
                    fieldType: 'A'
                  }, function (err, result) {
                    if (err == null || result == null) {
                      ovh.request('POST', '/domain/zone/' + element + '/refresh', function (err, result) {
                        if (err !== null || result !== null) {
                          console.log(err || result);
                        } else {
                          console.log(result);
                        }
                      });
                    } else {
                      console.log(err || result);
                    }
                  });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  await main();

  setInterval(main, 5000);