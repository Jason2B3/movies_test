import React, { useState, useReducer } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function reducerFN(state, action) {
  console.log(state); // built in without supplying argument
  console.log(action);
  // Increment or decrement our current count by 1
  if (action.type === "success") return { queryResult: "success" };
  if (action.type === "failure") return { queryResult: "failure" };
  if (action.type === "pending") return { queryResult: "pending" };
  // If action.type is different than the above two options, return state as is
  return state;
}

function App() {
  //% 1) Set up stateful variable for loading
  const [loadState, dispatch] = useReducer(reducerFN, {
    queryResult: undefined,
  });
  const [poster, setPoster] = useState([]);
  const inputRef = React.useRef("");

  const btnHandler = async function (e) {
    const showInfo = await showResearch(inputRef.current.value); // will equal the return obj at end
    console.log(showInfo);
    inputRef.current.value = ""; // clear input fields
  };

  // Make it so this function is created ONE TIME, on startup
  const showResearch = React.useCallback(async function (query) {
    dispatch({ type: "pending" }); // render loading message
    try {
      const result = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${query}`
      );
      if (!result.ok) throw new Error("No shows found in the search results");
      const parsedData = await result.json();
      // Now take steps to render your poster
      setPoster((prevState) => [parsedData.image.medium]); // update poster array
      dispatch({ type: "success" }); // End loading message
      return {
        // Time to rename shit!
        showID: parsedData.id,
        title: parsedData.name,
        score: parsedData.rating.average,
        genre: parsedData.type,
      };
    } catch (errorObj) {
      dispatch({ type: "failure" });
    }
  }, []);

  // Start your application by showing this poster on startup
  React.useEffect(() => {
    showResearch("Erased");
  }, [showResearch]);

  return (
    <React.Fragment>
      <section>
        <input ref={inputRef} placeholder={"enter show here"} />
        <button onClick={btnHandler}>Fetch Media</button>
      </section>
      <section>
        {loadState.queryResult === undefined && (
          <p>Search for a movie or show!</p>
        )}
        {loadState.queryResult === "pending" && <p>Searching for media...</p>}
        {loadState.queryResult === "failure" && <p>No search results found</p>}
        {loadState.queryResult === "success" && <img src={poster[0]} />}
      </section>
    </React.Fragment>
  );
}

export default App;
