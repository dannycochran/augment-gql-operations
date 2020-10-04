import { DocumentNode, GraphQLSchema, SelectionNode } from 'graphql';
import gql from 'graphql-tag';

type CodegenDocuments = {
  location: string;
  document: DocumentNode;
  rawSDL: string;
};

const codegen = {
  plugin: (schema: GraphQLSchema, documents: CodegenDocuments[], config: { content: string }) => {
    try {
      const ContentDocument = gql`
        query {
          ${config.content}
        }
      `;

      const queryDefinition = ContentDocument.definitions[0];
      if (queryDefinition && 'selectionSet' in queryDefinition) {
        const { selectionSet } = queryDefinition;

        documents?.forEach(codegenDocument => {
          const { definitions } = codegenDocument.document;
          definitions?.forEach(definition => {
            if ('operation' in definition) {
              const existingSelections = definition.selectionSet.selections.reduce<Set<string>>((agg, selection) => {
                if ('name' in selection) {
                  agg.add(selection.name.value);
                }
                return agg;
              }, new Set());
              const newSelections = selectionSet.selections.reduce<SelectionNode[]>(
                (agg, selection) => {
                  if ('name' in selection && !existingSelections.has(selection.name.value)) {
                    agg.push(selection);
                  }
                  return agg;
                },
                [...definition.selectionSet.selections],
              );
              Object.assign(definition.selectionSet, {
                selections: newSelections,
              });
            }
          });
        });
      }
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.warn(`"augment-gql-operations" failed: ${err.message}`);
      throw err;
    }
  },

  validate: (schema: GraphQLSchema, documents: CodegenDocuments[], config?: { content?: string }) => {
    if (!config?.content) {
      throw new Error(`You must specify "content" in the configuration for "augment-gql-operations".`);
    }
  },
};

module.exports = codegen;
