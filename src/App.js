import React, { useState, useReducer } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function reducerFN(state, action) {
  if (action.type === "success") return { queryResult: "success" };
  if (action.type === "failure") return { queryResult: "failure" };
  if (action.type === "pending") return { queryResult: "pending" };

  if (action.type === "successFire") return { queryResult: "successFire" };
  if (action.type === "failureFire") return { queryResult: "failureFire" };
  if (action.type === "pendingFire") return { queryResult: "pendingFire" };
  // If action.type is different than the above two options, return state as is
  return state;
}

function App() {
  //% Set up stateful variable for loading
  const [loadState, dispatch] = useReducer(reducerFN, {
    queryResult: undefined,
  });
  const inputRef = React.useRef("");

  const btnHandler = async function (e) {
    const showInfo = await sendToFireBase(inputRef.current.value); // will equal the return obj at end
    inputRef.current.value = ""; // clear input fields
  };
  //% Send data to your Firebase backend
  const sendToFireBase = React.useCallback(async function (query) {
    dispatch({ type: "pending" });
    try {
      //$ Grab a poster from the TVMAZE API depending on the input, along with other info
      const result = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${query}`
      );
      if (!result.ok) throw new Error("No shows found in the search results");
      const parsedData = await result.json();
      const reorgData = {
        poster: parsedData.image.medium,
        title: parsedData.name,
        score: parsedData.rating.average,
      };
      //$ Send the data to our Firebase backend
      const sendTo = await fetch(
        `https://react-firebase-realtime-ex-default-rtdb.firebaseio.com/movies.json`,
        {
          method: "POST", // Firebase creates a new resource in our dummy database
          body: JSON.stringify(reorgData), // the content we store
          headers: {
            "Content-Type": "application/json",
            // ▲▲ describes the content that will be set (needed for some backends)
          },
        }
      );
      const sentToFB = await sendTo.json();
      console.log(sentToFB);
      dispatch({ type: "success" }); // End loading message
    } catch {
      dispatch({ type: "failure" });
    }
  }, []);

  //% Pull existing data down from your Firebase Backend
  const [loadedFlicks, setLoadedFlicks] = React.useState([]); // will hold show data
  const fetchFireHandler = React.useCallback(async function (e) {
    dispatch({ type: "pendingFire" });
    try {
      //$ Fetch the JSON data from your Firebase back end
      const response = await fetch(
        `https://react-firebase-realtime-ex-default-rtdb.firebaseio.com/movies.json`
      );
      if (!response.ok) throw new Error("Failed to fetch your submissions!");
      const data = await response.json();
      console.log(data); // shows [{showData}, {showData2}]
      //$ Take your JSON object, then push it into a stateful array which will be rendered as a list
      for (const key in data) {
        setLoadedFlicks((prevState) => [
          ...prevState,
          {
            id: key,
            title: data[key].title,
            poster: data[key].poster,
            score: data[key].score,
          },
        ]);
      }
      console.log(loadedFlicks); // look at [{showData}, {showData2}]
      dispatch({ type: "successFire" });
    } catch (error) {
      dispatch({ type: "failureFire" });
      alert("FAIL");
    }
  }, []);

  return (
    <React.Fragment>
      <section>
        <input ref={inputRef} placeholder={"enter show here"} />
        <button className="sendUp" onClick={btnHandler}>
          Send poster to firebase
        </button>
        <button className="pullDown" onClick={fetchFireHandler}>
          Fetch all stored posters
        </button>
      </section>

      <section>
        {loadState.queryResult === undefined && (
          <p>Pull down some posters from your backend, or send new ones up</p>
        )}
        {loadState.queryResult === "pending" && <p>Searching for media...</p>}
        {loadState.queryResult === "failure" && (
          <p>That show does not exist in our database</p>
        )}
        {loadState.queryResult === "success" && (
          <p>Show data sent successfully</p>
        )}

        {loadedFlicks.length === 0 &&
          loadState.queryResult === "successFire" && (
            <p>No shows saved at the moment</p>
          )}
        {loadedFlicks.map((obj) => {
          return <img key={obj.id} src={obj.poster} />;
        })}
      </section>
    </React.Fragment>
  );
}

export default App;
