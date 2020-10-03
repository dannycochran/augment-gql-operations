import { DocumentNode, GraphQLSchema, SelectionNode } from 'graphql';
import gql from 'graphql-tag';

type CodegenDocuments = {
  location: string;
  document: DocumentNode;
  rawSDL: string;
};

const codegen = {
  plugin: (schema: GraphQLSchema, documents: CodegenDocuments[], config?: { content?: string }) => {
    if (!config?.content) {
      return;
    }

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
              const existingSelectionsMap = definition.selectionSet.selections.reduce<Map<string, SelectionNode>>(
                (agg, selection) => {
                  if ('name' in selection) {
                    agg.set(selection.name.value, selection);
                  }
                  return agg;
                },
                new Map(),
              );
              const newSelections = selectionSet.selections.reduce<SelectionNode[]>(
                (agg, selection) => {
                  if ('name' in selection && !existingSelectionsMap.has(selection.name.value)) {
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
      console.warn(`Failed to parse content for augment-gql-operations: ${err.message}`);
    }
  },
};

module.exports = codegen;
