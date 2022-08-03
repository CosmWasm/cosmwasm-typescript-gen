import * as t from '@babel/types';
import { QueryMsg, ExecuteMsg } from './types';

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
    v4?: boolean
    mutations?: boolean
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

interface ReactQueryMutationHooks {
    execMsg: ExecuteMsg
    contractName: string
    ExecuteClient: string
    options?: ReactQueryOptions
}
export declare const createReactQueryMutationHooks: ({ execMsg, contractName, ExecuteClient, options }: ReactQueryMutationHooks) => any

interface ReactQueryMutationHook {
    mutationHookName: string;
    mutationHookParamsTypeName: string;
    execMethodName: string;
    execArgs: t.ObjectProperty[]
    options?: ReactQueryOptions
}

export declare const createReactQueryMutationHook: ({
    mutationHookName,
    mutationHookParamsTypeName,
    execMethodName,
    execArgs,
    options,
}: ReactQueryMutationHook) => any

interface ReactQueryMutationHookInterface {
    ExecuteClient: string
    mutationHookParamsTypeName: string;
    jsonschema: any
}

export declare const createReactQueryMutationArgsInterface: ({
    ExecuteClient,
    mutationHookParamsTypeName,
    jsonschema
}: ReactQueryMutationHookInterface) => t.ExportNamedDeclaration;

export { };
