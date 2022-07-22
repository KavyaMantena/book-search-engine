import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  concat,
} from "@apollo/client";

import SearchBooks from "./pages/SearchBooks";
import SavedBooks from "./pages/SavedBooks";
import Navbar from "./components/Navbar";

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: localStorage.getItem("id_token") || null,
    },
  }));

  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route path="/" exact={true}>
              <SearchBooks />
            </Route>
            <Route path="/saved" exact={true}>
              <SavedBooks />
            </Route>
            <Route path="*">
              <h1 className="display-2">Wrong page!</h1>
            </Route>
          </Switch>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;

// {
//   /* <Switch>
//             <Route exact path="/" component={SearchBooks} />
//             <Route exact path="/saved" component={SavedBooks} />
//             <Route render={() => <h1 className="display-2">Wrong page!</h1>} />
//           </Switch> */
// }
