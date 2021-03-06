import * as t from '@babel/types';
import { QueryMsg } from './types';

interface ReactQueryHooks {
    queryMsg: QueryMsg
    contractName: string
    QueryClient: string
    options?: ReactQueryOptions
}
interface ReactQueryHookQuery {
    hookName: string;
    hookParamsTypeName: string;
    hookKeyName: string;
    responseType: string;
    methodName: string;
    jsonschema: any;
}

export declare interface ReactQueryOptions {
    optionalClient?: boolean
}
export declare const createReactQueryHooks: ({ queryMsg, contractName, QueryClient, options }: ReactQueryHooks) => any;
export declare const createReactQueryHook: ({ hookName, hookParamsTypeName, responseType, hookKeyName, methodName, jsonschema }: ReactQueryHookQuery) => t.ExportNamedDeclaration;
interface ReactQueryHookQueryInterface {
    QueryClient: string;
    hookParamsTypeName: string;
    responseType: string;
    jsonschema: any;
}
export declare const createReactQueryHookInterface: ({ QueryClient, hookParamsTypeName, responseType, jsonschema }: ReactQueryHookQueryInterface) => t.ExportNamedDeclaration;
export { };
