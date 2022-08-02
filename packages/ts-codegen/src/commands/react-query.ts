import { prompt } from '../prompt';
import reactQuery from '../react-query';
import { readSchemas } from '../utils';

export default async (argv) => {

    const questions = [
        {
            _: true,
            type: 'path',
            name: 'schema',
            message: 'which directory contains the the Rust contracts?',
            default: './schema'
        },
        {
            _: true,
            type: 'path',
            name: 'out',
            message: 'where is the output directory?',
            default: './ts'
        },
        {
            _: true,
            type: 'string',
            name: 'name',
            message: 'contract name?'
        },
        {
            type: 'confirm',
            name: 'optionalClient',
            message: 'optionalClient?',
            default: false
        },
        {
            type: 'confirm',
            name: 'v4',
            message: 'Use react-query v4?',
            default: false
        }
    ];

    const { schema, out, name, ...options } = await prompt(questions, argv);
    const schemas = readSchemas({ schemaDir: schema, argv });
    await reactQuery(name, schemas, out, options);
};
