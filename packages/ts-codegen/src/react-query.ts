import { pascal } from "case";
import { header } from './header';
import { join } from "path";
import { sync as mkdirp } from "mkdirp";
import * as w from 'wasm-ast-types';
import * as t from '@babel/types';
import { writeFileSync } from 'fs';
import generate from "@babel/generator";
import { findAndParseTypes, findExecuteMsg, findQueryMsg } from "./utils";
import { getMessageProperties, ReactQueryOptions } from "wasm-ast-types";



export default async (contractName: string, schemas: any[], outPath: string, options?: ReactQueryOptions) => {

    const ReactQueryFile = pascal(`${contractName}Contract`) + '.react-query.ts';
    const Contract = pascal(`${contractName}Contract`)

    const QueryMsg = findQueryMsg(schemas);
    const ExecuteMsg = findExecuteMsg(schemas);
    const typeHash = await findAndParseTypes(schemas);

    const ExecuteClient = pascal(`${contractName}Client`);
    const QueryClient = pascal(`${contractName}QueryClient`);

    const body = [];

    const reactQueryImports = ['useQuery', 'UseQueryOptions']
    const clientImports = []

    QueryMsg && clientImports.push(QueryClient)

    // check that there are commands within the exec msg
    const shouldGenerateMutationHooks = ExecuteMsg && options?.mutations && options?.v4 && getMessageProperties(ExecuteMsg).length > 0

    if (shouldGenerateMutationHooks) {
        body.push(w.importStmt(['ExecuteResult'], '@cosmjs/cosmwasm-stargate'));
        reactQueryImports.push(...['UseMutationOptions', 'useMutation'])
        clientImports.push(ExecuteClient)
    }

    // react-query imports
    body.push(
        w.importStmt(reactQueryImports, options?.v4 ? '@tanstack/react-query' : 'react-query')
    );

    // general contract imports
    body.push(w.importStmt(Object.keys(typeHash), `./${Contract}`));

    // client imports
    body.push(w.importStmt(clientImports, `./${Contract}`));


    // query messages
    if (QueryMsg) {
        [].push.apply(body,
            w.createReactQueryHooks({
                queryMsg: QueryMsg,
                contractName: contractName,
                QueryClient,
                options
            })
        );
    }

    if (shouldGenerateMutationHooks) {
        [].push.apply(body,
            w.createReactQueryMutationHooks({
                execMsg: ExecuteMsg,
                contractName: contractName,
                ExecuteClient,
                options
            })
        );
    }



    const code = header + generate(
        t.program(body)
    ).code;

    mkdirp(outPath);
    writeFileSync(join(outPath, ReactQueryFile), code);
};
