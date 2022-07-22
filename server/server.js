const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const routes = require("./routes");
const db = require("./config/connection");
const jwt = require("jsonwebtoken");
// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");

const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    // get the user token from the headers
    const token = req.headers.authorization;
    // verify token and get user data out of it
    try {
      if (token && token !== "null" && token !== "undefined") {
        const verified = jwt.verify(token, secret, {
          maxAge: expiration,
        });
        return { user: verified.data };
      } else {
        return { user: {} };
      }
    } catch {
      console.log("Invalid token");
      return res.status(400).json({ message: "invalid token!" });
    }
  },
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.use(routes);

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go to test our GQL API
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};
// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
