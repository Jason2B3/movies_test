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
  //% Send data to your Firebase backend
  const sendToFireBase = React.useCallback(async function (query) {
    dispatch({ type: "pending" });
    try {
      //~ Grab a poster from the TVMAZE API depending on the input
      const result = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${query}`
      );
      if (!result.ok) throw new Error("No shows found in the search results");
      const parsedData = await result.json();
      //~ Send that poster to Firebase, along with other show details
      const orgData={
        showID: parsedData.id,
        poster: parsedData.image.medium,
        title: parsedData.name,
        score: parsedData.rating.average,
        genre: parsedData.type,        
      }
      //! SEND HERE
      dispatch({ type: "success" }); // End loading message
      
    } catch {
      dispatch({ type: "failure" });
    }
  }, []);
  // Make it so this function is created ONE TIME, on startup
  const showResearch = React.useCallback(async function (query) {
    dispatch({ type: "pending" }); // render loading message
    try {
     //! Fetch data FROM Firebase and render a list of posters
    } catch (errorObj) {
      dispatch({ type: "failure" });
    }
  }, []);

  return (
    <React.Fragment>
      <section>
        <input ref={inputRef} placeholder={"enter show here"} />
        <button className="sendUp" onClick={btnHandler}>
          Send poster to firebase
        </button>
        <button className="pullDown">Fetch all stored posters</button>
      </section>
      <section>
        {loadState.queryResult === undefined && (
          <p>Pull down some posters from your backend!</p>
        )}
        {loadState.queryResult === "pending" && <p>Searching for media...</p>}
        {loadState.queryResult === "failure" && <p>No search results found</p>}
        {loadState.queryResult === "success" && <img src={poster[0]} />}
      </section>
    </React.Fragment>
  );
}

export default App;
