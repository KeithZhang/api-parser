import axios from 'axios';
import fs from 'fs';

const pullConfig = async () => {
  const data: {
    data: Array<{
      list: Array<{
        title: string;
        path: string;
        method: 'POST' | 'GET';
        req_params: Array<{
          name: string;
        }>;
        req_query: Array<{
          name: string;
          required: '0' | '1';
        }>;
        req_body_other: string;
        res_body: string;
      }>;
    }>;
  } = await axios.get(
    'http://121.199.199.140/api/open/plugin/export-full?type=json&pid=11&status=all&token=f4c2a58521a19433f4ac08fbf5835557fb1cf12d63fd0730fe4ff2b395e2b638'
  );
  console.log('data...', data);
  if (fs.existsSync('./dist/index.ts')) {
    fs.unlinkSync('./dist/index.ts');
  }
  data.data.forEach(categories => {
    categories.list.forEach(apiItem => {
      const {
        path,
        method,
        req_params,
        req_query,
        req_body_other,
        res_body
      } = apiItem;
      if (method == 'GET') {
        let functionString = '';

        let tempUrl = path.slice(0, path.indexOf('{'));

        let functionName = tempUrl
          .split('/')
          .filter(v => v != '')
          .reduce((pre, cur) => {
            return pre + cur.replace(/^\S/, s => s.toUpperCase());
          });

        let requestFields = req_query.map(v => {
          `${v.name}${v.required == '1' ? '?' : ''} : string;`;
        });
        let requestInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) + 'Request';

        let requestInterfaceString = `export interface ${requestInterfaceName}  {
              ${requestFields.join('')}
            }`;

        let responsInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) + 'Response';

        let responsInterfaceString = '';
        if (!res_body) {
          responsInterfaceString = ``;
          responsInterfaceName = 'any';
        } else {
          let responseJson = JSON.parse(res_body);
          responsInterfaceString = getMethodResponseInterfaces(
            responseJson,
            responsInterfaceName
          );
        }

        let paramsString =
          req_query.length > 0 ? `params?: ${requestInterfaceName}` : '';

        if (req_params.length > 0) {
          functionString = `const ${functionName} = async (${
            req_params[0].name
          }: string, ${paramsString}) :Promise<${responsInterfaceName}>  => {
            return await PantherSdk.get({ url: \`${tempUrl}\$\{${
            req_params[0].name
          }\}\`, ${req_query.length > 0 ? 'params' : ''} });
          };`;
        } else {
          functionString = `const ${functionName} = async (${paramsString}) : Promise<${responsInterfaceName}> => {
            return await PantherSdk.get({ url: '${path}', ${
            req_query.length > 0 ? 'params' : ''
          } });
          };`;
        }

        console.log('requestInterfaceString...', requestInterfaceString);
        console.log('responsInterfaceString...', responsInterfaceString);
        console.log('functionString...', functionString);

        fs.appendFileSync('./dist/index.ts', requestInterfaceString);
        fs.appendFileSync('./dist/index.ts', responsInterfaceString);
        fs.appendFileSync('./dist/index.ts', functionString);
      }
    });
  });
};

const getMethodResponseInterfaces = (obj: any, interfaceName: string) => {
  let interfaces: Array<string> = [];
  const loop = (obj: any, interfaceName: string) => {
    let fileds = [] as any;
    if (obj.type === 'object') {
      Object.keys(obj.properties).map(v => {
        if (obj.properties[v].type === 'string') {
          fileds.push(`${v}: string;`);
        } else if (obj.properties[v].type === 'number') {
          fileds.push(`${v}: number;`);
        } else if (obj.properties[v].type === 'object') {
          let childInterfaceName = v.replace(/^\S/, s => s.toUpperCase());
          fileds.push(`${v}: ${childInterfaceName};`);
          loop(obj.properties[v], childInterfaceName);
        }
      });

      let interfaceString = `export interface ${interfaceName} {
        ${fileds.join('')}
      }`;
      interfaces.push(interfaceString);
    }
  };
  loop(obj, interfaceName);
  return interfaces.join('');
};

// const login = async (data?: any) => {
//   return await PantherSdk.post({ url: '/shop/login', data });
// };

// const counselorScore = async (tradeId: string, params?: any) => {
//   return await ZssSdk.get(`/trade/rate/avg/${tradeId}`, params);
// };

pullConfig();
