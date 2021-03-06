const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const {
  makeRemoteExecutableSchema,
  mergeSchemas,
  introspectSchema
} = require('graphql-tools');
const { createHttpLink } =  require('apollo-link-http');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

// const { apolloHapi, graphiqlHapi } = require('apollo-server');


const app = express();

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(async (req, res) => {
    const ServiceLink1 = createHttpLink({
      uri: `http://localhost:3000/graphql`,
      fetch
    });

    const ServiceLink2 = createHttpLink({
      uri: `http://localhost:8080/graphql`,
      fetch
    });

    const serviceSchema2 = async () => {
      const schema = await introspectSchema(ServiceLink2);

      return makeRemoteExecutableSchema({
        schema,
        link: ServiceLink2
      });
    };

    const ServiceSchema1 = async () => {
      const schema = await introspectSchema(ServiceLink1);



      return makeRemoteExecutableSchema({
        schema,
        link: ServiceLink1
      });
    };

    const Schema1 = await ServiceSchema1();
    const Schema2 = await serviceSchema2();

    const schema = mergeSchemas({
      schemas: [Schema1, Schema2]
    });

    return {
      schema: schema,
      graphiql: true,
      context: { req, res }
    };
  })
);

const PORT = 4000;

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(PORT, () => {
  console.log(`Server available at ${PORT}`);
});
