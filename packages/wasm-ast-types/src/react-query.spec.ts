import { importStmt } from './utils'
import generate from '@babel/generator';
import * as t from '@babel/types';

import query_msg from './../../../__fixtures__/basic/query_msg.json';
import execute_msg from './../../../__fixtures__/basic/execute_msg_for__empty.json';
import approval_response from './../../../__fixtures__/basic/approval_response.json';
import all_nft_info_response from './../../../__fixtures__/basic/all_nft_info_response.json';
import approvals_response from './../../../__fixtures__/basic/approvals_response.json';
import collection_info_response from './../../../__fixtures__/basic/collection_info_response.json';
import contract_info_response from './../../../__fixtures__/basic/contract_info_response.json';
import instantiate_msg from './../../../__fixtures__/basic/instantiate_msg.json';
import nft_info_response from './../../../__fixtures__/basic/nft_info_response.json';
import num_tokens_response from './../../../__fixtures__/basic/num_tokens_response.json';
import operators_response from './../../../__fixtures__/basic/operators_response.json';
import owner_of_response from './../../../__fixtures__/basic/owner_of_response.json';
import tokens_response from './../../../__fixtures__/basic/tokens_response.json';

import {
  createReactQueryHook,
  createReactQueryHooks,
  createReactQueryMutationHooks,
} from './react-query'

const expectCode = (ast) => {
  expect(
    generate(ast).code
  ).toMatchSnapshot();
}

const printCode = (ast) => {
  console.log(
    generate(ast).code
  );
}

// it('createReactQueryHook', () => {
//   printCode(createReactQueryHook({
//     methodName: 'allNftInfo',
//     hookName: 'useSg721AllNftInfoQuery',
//     hookParamsTypeName: 'Sg721CollectionInfoQuery',
//     responseType: 'AllNftInfoResponse',
//     hookKeyName: 'Sg721AllNftInfo'
//   }))
// });


it('createReactQueryHooks', () => {
  expectCode(t.program(
    createReactQueryHooks(
      {
        queryMsg: query_msg,
        contractName: 'Sg721',
        QueryClient: 'Sg721QueryClient'
      }
    )))
  expectCode(t.program(
    createReactQueryHooks(
      {
        queryMsg: query_msg,
        contractName: 'Sg721',
        QueryClient: 'Sg721QueryClient'
      }
    )))
  expectCode(t.program(
    createReactQueryHooks(
      {
        queryMsg: query_msg,
        contractName: 'Sg721',
        QueryClient: 'Sg721QueryClient',
        options: { optionalClient: true }
      }
    )))
  expectCode(t.program(
    createReactQueryHooks(
      {
        queryMsg: query_msg,
        contractName: 'Sg721',
        QueryClient: 'Sg721QueryClient',
        options: { v4: true }
      }
    )))
  expectCode(t.program(
    createReactQueryHooks(
      {
        queryMsg: query_msg,
        contractName: 'Sg721',
        QueryClient: 'Sg721QueryClient',
        options: { optionalClient: true, v4: true }
      }
    )))
  expectCode(t.program(
    createReactQueryMutationHooks(
      {
        execMsg: execute_msg,
        contractName: 'Sg721',
        ExecuteClient: 'Sg721Client',
      }
    )))
});

