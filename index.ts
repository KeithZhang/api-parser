import axios from 'axios';
import fs from 'fs';

const baseDir = '/Users/keith/project/biz/jushe/panther-weapp/src/api';

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
    'http://yapi.jushewang.com/api/open/plugin/export-full?type=json&pid=11&status=all&token=f4c2a58521a19433f4ac08fbf5835557fb1cf12d63fd0730fe4ff2b395e2b638'
  );
  console.log('data...', data);

  if (fs.existsSync(baseDir)) {
    fs.existsSync(`${baseDir}/index.ts`) &&
      fs.unlinkSync(`${baseDir}/index.ts`);
    fs.existsSync(`${baseDir}/types/index.ts`) &&
      fs.unlinkSync(`${baseDir}/types/index.ts`);
  } else {
    fs.mkdirSync(`${baseDir}/types`, { recursive: true });
  }

  fs.appendFileSync(
    `${baseDir}/index.ts`,
    `
  import { PantherSdk } from 'panther-kit';
  import * as types from './types';
  `
  );

  let functionNames: Array<string> = [];
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

        let detail = path.indexOf('{') === -1 ? '' : 'Detail';
        let url =
          path.indexOf('{') === -1 ? path : path.slice(0, path.indexOf('{'));

        let functionName = getFunctionName(url);

        let requestFields = req_query.map(v => {
          `${v.name}${v.required == '1' ? '?' : ''} : string;`;
        });
        let requestInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) +
          detail +
          'GetRequest';

        let requestInterfaceString = `export interface ${requestInterfaceName}  {
              ${requestFields.join('')}
            }`;

        let responsInterfaceString = '';
        let responsInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) +
          detail +
          'GetResponse';

        if (!res_body) {
          responsInterfaceString = ``;
          responsInterfaceName = 'any';
        } else {
          let responseJson = JSON.parse(res_body);
          responsInterfaceString = getInterfaceTree(
            responseJson,
            responsInterfaceName
          );
        }

        let paramsString =
          req_query.length > 0 ? `params?: types.${requestInterfaceName}` : '';

        if (req_params.length > 0) {
          functionString = `export const ${functionName}By${firstLetterToUpperCase(
            req_params[0].name
          )} = async (${
            req_params[0].name
          }: string, ${paramsString}) :Promise<{res: ${
            responsInterfaceName == 'any'
              ? 'any'
              : 'types.' + responsInterfaceName
          }, err: Error | null}>  => {
            return await PantherSdk.get({ url: \`${url}\$\{${
            req_params[0].name
          }\}\`, ${req_query.length > 0 ? 'params' : ''} });
          };`;
          functionNames.push(
            `${functionName}By${firstLetterToUpperCase(req_params[0].name)}`
          );
        } else {
          functionString = `export const ${functionName} = async (${paramsString}) : Promise<{res:${
            responsInterfaceName == 'any'
              ? 'any'
              : 'types.' + responsInterfaceName
          }, err: Error | null}> => {
            return await PantherSdk.get({ url: '${path}', ${
            req_query.length > 0 ? 'params' : ''
          } });
          };`;
          functionNames.push(`${functionName}`);
        }

        // console.log('requestInterfaceString...', requestInterfaceString);
        // console.log('responsInterfaceString...', responsInterfaceString);
        // console.log('functionString...', functionString);

        fs.appendFileSync(`${baseDir}/types/index.ts`, requestInterfaceString);
        fs.appendFileSync(`${baseDir}/types/index.ts`, responsInterfaceString);
        fs.appendFileSync(`${baseDir}/index.ts`, functionString);
      }

      if (method == 'POST') {
        let detail = path.indexOf('{') === -1 ? '' : 'Detail';
        let url =
          path.indexOf('{') === -1 ? path : path.slice(0, path.indexOf('{'));
        let functionName = getFunctionName(url);

        let requestInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) +
          detail +
          'PostRequest';

        let requestInterfaceString = '';
        if (!req_body_other) {
          requestInterfaceString = ``;
          requestInterfaceName = 'any';
        } else {
          let requestJson = JSON.parse(req_body_other);
          requestInterfaceString = getInterfaceTree(
            requestJson,
            requestInterfaceName
          );
        }

        //
        let responsInterfaceString = '';
        let responsInterfaceName =
          functionName.replace(/^\S/, s => s.toUpperCase()) +
          detail +
          'PostResponse';

        if (!res_body) {
          responsInterfaceString = ``;
          responsInterfaceName = 'any';
        } else {
          let responseJson = JSON.parse(res_body);
          responsInterfaceString = getInterfaceTree(
            responseJson,
            responsInterfaceName
          );
        }
        console.log('functionName...', functionName, '| url...', url);

        //
        let functionString = '';
        if (req_params.length > 0) {
          functionString = `export const ${functionName}By${firstLetterToUpperCase(
            req_params[0].name
          )} = async (${
            req_params[0].name
          }: string, data: types.${requestInterfaceName}) :Promise<{res: ${
            responsInterfaceName == 'any'
              ? 'any'
              : 'types.' + responsInterfaceName
          }, err: Error | null}>  => {
            return await PantherSdk.post({ url: \`${url}\$\{${
            req_params[0].name
          }\}\`, data });
          };`;
          functionNames.push(
            `${functionName}By${firstLetterToUpperCase(req_params[0].name)}`
          );
        } else {
          functionString = `export const ${functionName} = async (data: types.${requestInterfaceName}) : Promise<{res: ${
            responsInterfaceName == 'any'
              ? 'any'
              : 'types.' + responsInterfaceName
          }, err: Error | null}> => {
            return await PantherSdk.post({ url: '${url}', data });
          };`;
          functionNames.push(`${functionName}`);
        }

        fs.appendFileSync(`${baseDir}/types/index.ts`, requestInterfaceString);
        fs.appendFileSync(`${baseDir}/types/index.ts`, responsInterfaceString);
        fs.appendFileSync(`${baseDir}/index.ts`, functionString);
      }
    });
  });

  fs.appendFileSync(
    `${baseDir}/index.ts`,
    `export default {
    ${functionNames.join(',')}
  }`
  );
};

const firstLetterToUpperCase = (string: string) => {
  let result = string;
  return result.replace(/^\S/, s => s.toUpperCase());
};

const getFunctionName = (url: string) => {
  let functionName = url
    .split('/')
    .filter(v => v != '')
    .reduce((pre, cur) => {
      return pre + cur.replace(/^\S/, s => s.toUpperCase());
    });

  return functionName;
};

const getInterfaceTree = (obj: any, interfaceName: string) => {
  const loop = (obj: any) => {
    if (obj.type === 'object') {
      let fileds = [] as any;
      Object.keys(obj.properties).map(v => {
        const required =
          obj.required && obj.required.indexOf(v) !== -1 ? '' : '?';
        let result = loop(obj.properties[v]);

        // 基础类型加注释
        if (result.type === 'string') {
          fileds.push(`
            /**
             * ${result.description}
             */  
            ${v}${required}: ${result.type};
          `);
        } else if (result.type === 'boolean') {
          fileds.push(`
            /**
             * ${result.description}
             */ 
            ${v}${required}: ${result.type};
          `);
        } else if (result.type === 'number') {
          fileds.push(`
            /**
             * ${result.description}
             */ 
            ${v}${required}: ${result.type};
          `);
        } else {
          fileds.push(`
            ${v}${required}: ${result.type};
          `);
        }
      });

      return {
        type: `{
          ${fileds.join('')}
        }`
      };
    } else if (obj.type === 'array') {
      let resultInterfaceName: any = loop(obj.items);
      return { type: `Array<${resultInterfaceName.type}>` };
    } else {
      return obj;
    }
  };

  let rootObj = loop(obj);
  let interfaceString = `export interface ${interfaceName} ${rootObj.type}`;
  return interfaceString;
};

// const login = async (data?: any) => {
//   return await PantherSdk.post({ url: '/shop/login', data });
// };

// const counselorScore = async (tradeId: string, params?: any) => {
//   return await ZssSdk.get(`/trade/rate/avg/${tradeId}`, params);
// };

pullConfig();
