### augment-gql-operation

This is a small plugin for [graphql-codegen](https://github.com/dotansimha/graphql-code-generator).
It allows you to add arbitrary GraphQL code to your operations (e.g. queries, mutations, subscriptions).

** Disclaimer: this is an experimental plugin for `graphql-codegen` and may not play nicely with all plugins. In theory it should be harmless but who knows!

### why?

There may be a call you always to make in every query and mutation but don't want to to remember to write it every time. For instance, your graph may expose "request details", e.g. meta information about the request (such as a debugging link).

This library allows you to add it to all your queries and mutations so that information is readily available.

### usage

Here's an example usage specifically with TypeScript output:

```yaml
generates:
  ./src/graphql/typesAndHooks.tsx:
    plugins:
      - 'typescript'
      - 'typescript-operations'
      - 'named-operations-object'
      - 'typescript-react-apollo'
      - 'fragment-matcher'
      - 'augment-gql-operations':
          content: 'requestDetails { debugLink }'
```

This will append the following graphql to all your queries, mutations, and subscriptions in `./src/graphql/typesAndHooks.tsx` (note it will not modify your original query files or documents):

```graphql
query GetItemQuery($id: String!) {
  getItem(id: $id) {
    name
    description
  }

  requestDetails {
    debugLink
  }
}
```
