import * as t from '@babel/types';
import { camel, pascal } from 'case';
import { ExecuteMsg, QueryMsg } from './types';
import {
    tsPropertySignature,
    tsObjectPattern,
    callExpression,
    getMessageProperties
} from './utils'
import { typeRefOrOptionalUnion, propertySignature, optionalConditionalExpression, shorthandProperty, typedIdentifier, omitTypeReference, pickTypeReference } from './utils/babel';
import { getParamsTypeAnnotation, getPropertySignatureFromProp, getPropertyType, getTypeFromRef } from './utils/types';
import type { Expression } from '@babel/types'

// TODO: this mutations boolean is not actually used here and only at a higher level
export interface ReactQueryOptions {
    optionalClient?: boolean
    v4?: boolean
    mutations?: boolean
}

const DEFAULT_OPTIONS: ReactQueryOptions = {
    optionalClient: false,
    v4: false,
    mutations: false
}


interface ReactQueryHookQuery {
    hookName: string;
    hookParamsTypeName: string;
    hookKeyName: string;
    responseType: string;
    methodName: string;
    jsonschema: any;
    options?: ReactQueryOptions
}

interface ReactQueryHooks {
    queryMsg: QueryMsg
    contractName: string
    QueryClient: string
    options?: ReactQueryOptions
}

export const createReactQueryHooks = ({
    queryMsg,
    contractName,
    QueryClient,
    options = {}
}: ReactQueryHooks) => {
    // merge the user options with the defaults
    options = { ...DEFAULT_OPTIONS, ...options }
    return getMessageProperties(queryMsg)
        .reduce((m, schema) => {
            const underscoreName = Object.keys(schema.properties)[0];
            const methodName = camel(underscoreName);
            const hookName = `use${pascal(contractName)}${pascal(methodName)}Query`;
            const hookParamsTypeName = `${pascal(contractName)}${pascal(methodName)}Query`;
            const responseType = pascal(`${methodName}Response`);
            const getterKey = camel(`${contractName}${pascal(methodName)}`);
            const jsonschema = schema.properties[underscoreName];
            return [
                createReactQueryHookInterface({
                    hookParamsTypeName,
                    responseType,
                    QueryClient,
                    jsonschema,
                    options
                }),
                createReactQueryHook(
                    {
                        methodName,
                        hookName,
                        hookParamsTypeName,
                        responseType,
                        hookKeyName: getterKey,
                        jsonschema,
                        options
                    }
                ),
                ...m,
            ]
        }, []);
};


export const createReactQueryHook = ({
    hookName,
    hookParamsTypeName,
    responseType,
    hookKeyName,
    methodName,
    jsonschema,
    options = {},
}: ReactQueryHookQuery) => {
    // merge the user options with the defaults
    options = { ...DEFAULT_OPTIONS, ...options }

    const keys = Object.keys(jsonschema.properties ?? {});
    let args = [];
    if (keys.length) {
        args = [
            t.objectExpression([
                ...keys.map(prop => {
                    return t.objectProperty(
                        t.identifier(camel(prop)),
                        t.memberExpression(
                            t.identifier('args'),
                            t.identifier(camel(prop))
                        )
                    )
                })
            ])
        ]
    }

    let props = ['client', 'options'];
    if (keys.length) {
        props = ['client', 'args', 'options'];
    }

    return t.exportNamedDeclaration(
        t.functionDeclaration(
            t.identifier(hookName),
            [
                tsObjectPattern(
                    [
                        ...props.map(prop => {
                            return t.objectProperty(
                                t.identifier(prop),
                                t.identifier(prop),
                                false,
                                true
                            )
                        })
                    ],
                    t.tsTypeAnnotation(t.tsTypeReference(
                        t.identifier(hookParamsTypeName)
                    ))
                )
            ],
            t.blockStatement(
                [

                    t.returnStatement(
                        callExpression(
                            t.identifier('useQuery'),
                            [
                                t.arrayExpression(
                                    generateUseQueryQueryKey(hookKeyName, props, options.optionalClient)
                                ),
                                t.arrowFunctionExpression(
                                    [],
                                    optionalConditionalExpression(
                                        t.identifier('client'),
                                        t.callExpression(
                                            t.memberExpression(
                                                t.identifier('client'),
                                                t.identifier(methodName)
                                            ),
                                            args
                                        ),
                                        t.identifier('undefined'),
                                        options.optionalClient
                                    ),
                                    false
                                ),
                                options.optionalClient
                                    ? t.objectExpression([
                                        t.spreadElement(t.identifier('options')),
                                        t.objectProperty(
                                            t.identifier('enabled'),
                                            t.logicalExpression(
                                                '&&',
                                                t.unaryExpression(
                                                    '!',
                                                    t.unaryExpression('!', t.identifier('client'))
                                                ),
                                                t.optionalMemberExpression(
                                                    t.identifier('options'),
                                                    t.identifier('enabled'),
                                                    false,
                                                    true
                                                )
                                            )),
                                    ])
                                    : t.identifier('options'),
                            ],
                            t.tsTypeParameterInstantiation(
                                [
                                    typeRefOrOptionalUnion(
                                        t.identifier(responseType),
                                        options.optionalClient
                                    ),
                                    t.tsTypeReference(
                                        t.identifier('Error')
                                    ),
                                    t.tsTypeReference(
                                        t.identifier(responseType)
                                    ),
                                    t.tsArrayType(
                                        t.tsParenthesizedType(
                                            t.tsUnionType(
                                                [
                                                    t.tsStringKeyword(),
                                                    t.tsUndefinedKeyword()
                                                ]
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    )

                ]
            ),

        )
    )

};

interface ReactQueryMutationHookInterface {
    ExecuteClient: string
    mutationHookParamsTypeName: string;
    jsonschema: any
    properties: any
    useMutationTypeParameter: t.TSTypeParameterInstantiation
}

/**
 * Example:
```
export interface Cw4UpdateMembersMutation {
  client: Cw4GroupClient
  args: {
    tokenId: string
    remove: string[]
  }
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, Pick<Cw4UpdateMembersMutation, 'args'>>,
    'mutationFn'
  >
}
```
 */
export const createReactQueryMutationArgsInterface = ({
    ExecuteClient,
    mutationHookParamsTypeName,
    jsonschema,
    properties,
    useMutationTypeParameter
}: ReactQueryMutationHookInterface) => {

    const typedUseMutationOptions = t.tsTypeReference(
        t.identifier('UseMutationOptions'),
        useMutationTypeParameter
    )

    const body = [
        tsPropertySignature(
            t.identifier('client'),
            t.tsTypeAnnotation(
                t.tsTypeReference(
                    t.identifier(ExecuteClient)
                )
            ),
            false
        ),
        /*   options?: Omit<
         *     UseMutationOptions<ExecuteResult, Error, Pick<Cw4UpdateMembersMutation, 'args'>>,
         *     'mutationFn'
         *   >
         */
        tsPropertySignature(
            t.identifier('options'),
            t.tsTypeAnnotation(
                t.tsTypeReference(
                    t.identifier('Omit'),
                    t.tsTypeParameterInstantiation([
                        typedUseMutationOptions,
                        t.tsLiteralType(t.stringLiteral('mutationFn'))
                    ])
                )
            ),
            true
        )
    ]

  let argsType: t.TSTypeAnnotation = getParamsTypeAnnotation(jsonschema)
  // TODO: this should not have to be done manually.
  if (!argsType && jsonschema?.$ref?.startsWith('#/definitions/')) {
    let refName = jsonschema?.$ref
    if (/_for_[A-Z]/.test(refName)) {
      refName = refName.replace(/_for_/, 'For');
    }
    argsType = t.tsTypeAnnotation(getTypeFromRef(refName))
  }

  if (argsType) {
    body.push(
      t.tsPropertySignature(
        t.identifier('args'),
        argsType
    ))
  }


    return t.exportNamedDeclaration(t.tsInterfaceDeclaration(
        t.identifier(mutationHookParamsTypeName),
        null,
        [],
        t.tsInterfaceBody(
            body
        )
    ))
};


interface ReactQueryMutationHooks {
    execMsg: ExecuteMsg
    contractName: string
    ExecuteClient: string
    options?: ReactQueryOptions
}

export const createReactQueryMutationHooks = ({
    execMsg,
    contractName,
    ExecuteClient,
    options = {}
}: ReactQueryMutationHooks) => {
    // merge the user options with the defaults
    return getMessageProperties(execMsg)
        .reduce((m, schema) => {
            // update_members
            const execMethodUnderscoreName = Object.keys(schema.properties)[0];
            // updateMembers
            const execMethodName = camel(execMethodUnderscoreName);
            // Cw20UpdateMembersMutation
            const mutationHookParamsTypeName = `${pascal(contractName)}${pascal(execMethodName)}Mutation`;
            // useCw20UpdateMembersMutation
            const mutationHookName = `use${mutationHookParamsTypeName}`;

            const jsonschema = schema.properties[execMethodUnderscoreName];

            const properties = jsonschema.properties ?? {};

            // add, remove
            const execArgs: t.ObjectProperty[] = Object.keys(properties).map(prop => {
                return t.objectProperty(
                    t.identifier(prop),
                    t.identifier(camel(prop)),
                    false,
                    prop === camel(prop) // only use shorthand if the name is the same camel-cased
                );
            });

            // <ExecuteResult, Error, Pick<Cw4UpdateMembersMutation, 'args'>>
            const useMutationTypeParameter = t.tsTypeParameterInstantiation([
                // Data
                t.tSTypeReference(
                    t.identifier('ExecuteResult')
                ),
                // Error
                t.tsTypeReference(
                    t.identifier('Error')
                ),
                // Variables
                pickTypeReference(
                    t.tsTypeReference(
                        t.identifier(mutationHookParamsTypeName)
                    ),
                    'args'
                )
            ])

            return [
                createReactQueryMutationArgsInterface({
                    mutationHookParamsTypeName,
                    ExecuteClient,
                    jsonschema,
                    properties,
                    useMutationTypeParameter
                }),
                createReactQueryMutationHook({
                    execMethodName,
                    mutationHookName,
                    mutationHookParamsTypeName,
                    execArgs,
                    useMutationTypeParameter,
                }),
                ...m,
            ]
        }, []);
};


interface ReactQueryMutationHook {
    mutationHookName: string;
    mutationHookParamsTypeName: string;
    execMethodName: string;
    useMutationTypeParameter: t.TSTypeParameterInstantiation
    execArgs: t.ObjectProperty[]
}

/**
 *
 * Example:
```
export const useCw4UpdateMembersMutation = ({ client, options }: Omit<Cw4UpdateMembersMutation, 'args'>) =>
  useMutation<ExecuteResult, Error, Pick<Cw4UpdateMembersMutation, 'args'>>(
    ({ args }) => client.updateMembers(args),
    options
  )
```
 */
export const createReactQueryMutationHook = ({
    mutationHookName,
    mutationHookParamsTypeName,
    execMethodName,
    useMutationTypeParameter,
    execArgs,
}: ReactQueryMutationHook) => {

    // Commented out in case of using execute directly
    // const execMethodWithParams = t.objectExpression(
    //     [
    //         t.objectProperty(
    //             t.identifier(execMethodUnderscoreName),
    //             t.objectExpression([
    //                 ...execArgs
    //             ])
    //         )

    //     ]
    // )

    return t.exportNamedDeclaration(
        t.functionDeclaration(
            t.identifier(mutationHookName),
            [
                tsObjectPattern(
                    [
                        shorthandProperty('client'),
                        shorthandProperty('options')
                    ],
                    t.tsTypeAnnotation(
                        // we omit the args here because we provide them in .mutate(args)
                        omitTypeReference(
                            t.tsTypeReference(
                                t.identifier(mutationHookParamsTypeName),
                            ),
                            'args'
                        )
                    )
                )
            ],
            t.blockStatement(
                [
                    t.returnStatement(
                        callExpression(
                            t.identifier('useMutation'),
                            [
                                t.arrowFunctionExpression(
                                    // params
                                    [
                                        t.objectPattern(
                                            [
                                                // Commented out in case of using execute directly
                                                // ...['client', 'sender', 'contractAddress'].map(prop => shorthandProperty(prop)),
                                                // t.restElement(
                                                //     t.identifier('execParams')
                                                // )
                                                shorthandProperty('args')
                                            ],
                                        )
                                    ],
                                    t.callExpression(
                                        t.memberExpression(
                                            t.identifier('client'),
                                            t.identifier(execMethodName)
                                        ),
                                        [
                                            t.identifier('args')
                                            // Commented out in case of using execute directly
                                            // t.objectExpression([
                                            //     ...execArgs
                                            // ])
                                        ]
                                    ),
                                    // This is commented out if we want to use the execute directly
                                    // t.callExpression(
                                    //     t.memberExpression(
                                    //         t.identifier('client'),
                                    //         t.identifier('execute')
                                    //     ),
                                    //     // args
                                    //     [
                                    //         t.identifier('sender'),
                                    //         t.identifier('contractAddress'),
                                    //         execMethodWithParams,
                                    //         t.stringLiteral('auto'),
                                    //     ]
                                    // ),
                                    false // not async
                                ),
                                t.identifier('options'),
                            ],
                            useMutationTypeParameter
                        )
                    )

                ]
            ),

        )
    )

};


interface ReactQueryHookQueryInterface {
    QueryClient: string;
    hookParamsTypeName: string;
    responseType: string;
    jsonschema: any;
    options?: ReactQueryOptions
}

export const createReactQueryHookInterface = ({
    QueryClient,
    hookParamsTypeName,
    responseType,
    jsonschema,
    options = {},
}: ReactQueryHookQueryInterface) => {
    // merge the user options with the defaults
    options = { ...DEFAULT_OPTIONS, ...options }

    const typedUseQueryOptions = t.tsTypeReference(
        t.identifier('UseQueryOptions'),
        t.tsTypeParameterInstantiation([
            typeRefOrOptionalUnion(
                t.identifier(responseType),
                options.optionalClient
            ),
            t.tsTypeReference(t.identifier('Error')),
            t.tsTypeReference(
                t.identifier(responseType)
            ),
            t.tsArrayType(
                t.tsParenthesizedType(
                    t.tsUnionType([
                        t.tsStringKeyword(),
                        t.tsUndefinedKeyword()
                    ])
                )
            ),
        ])
    )

    const body = [
        tsPropertySignature(
            t.identifier('client'),
            t.tsTypeAnnotation(
                t.tsTypeReference(
                    t.identifier(QueryClient)
                )
            ),
            options.optionalClient
        ),
        tsPropertySignature(
            t.identifier('options'),
            t.tsTypeAnnotation(
                options.v4
                    ? t.tSIntersectionType([
                        omitTypeReference(typedUseQueryOptions, "'queryKey' | 'queryFn' | 'initialData'"),
                        t.tSTypeLiteral([
                            t.tsPropertySignature(
                                t.identifier('initialData?'),
                                t.tsTypeAnnotation(
                                    t.tsUndefinedKeyword()
                                )
                            )
                        ])
                    ])
                    : typedUseQueryOptions
            ),
            true
        )
    ];

    const props = getProps(jsonschema, true);
    if (props.length) {
        body.push(t.tsPropertySignature(
            t.identifier('args'),
            t.tsTypeAnnotation(
                t.tsTypeLiteral(props)
            )
        ))
    }


    return t.exportNamedDeclaration(t.tsInterfaceDeclaration(
        t.identifier(hookParamsTypeName),
        null,
        [],
        t.tsInterfaceBody(
            body
        )
    ))
};

const getProps = (jsonschema, camelize) => {
    const keys = Object.keys(jsonschema.properties ?? {});
    if (!keys.length) return [];

    return keys.map(prop => {
        const { type, optional } = getPropertyType(jsonschema, prop);
        return propertySignature(
            camelize ? camel(prop) : prop,
            t.tsTypeAnnotation(
                type
            ),
            optional
        )
    });
}

function generateUseQueryQueryKey(hookKeyName: string, props: string[], optionalClient: boolean): Array<Expression> {
    const queryKey: Array<Expression> = [
        t.stringLiteral(hookKeyName),
        t.optionalMemberExpression(
            t.identifier('client'),
            t.identifier('contractAddress'),
            false,
            optionalClient
        )
    ];

    if (props.includes('args')) {
        queryKey.push(t.callExpression(
            t.memberExpression(
                t.identifier('JSON'),
                t.identifier('stringify')
            ),
            [
                t.identifier('args')
            ]
        ))
    }
    return queryKey
}
