import React, { useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [poster, setPoster] = useState([]);
  const inputRef = React.useRef("nothing");
  const btnHandler = function () {
    showResearch(inputRef.current.value);
    inputRef.current.value = "";
  };

  function showResearch(query) {
    fetch(`https://api.tvmaze.com/singlesearch/shows?q=${query}`)
      .then((response) => {
        if (!response.ok)
          throw new Error("No shows found in the search results");
        return response.json();
      })
      .then((parsedData) => {
        console.log(parsedData);
        setPoster((prevState) => [...prevState, parsedData.image.medium]);
      })
      .catch((errorObj) => {
        alert(errorObj);
        console.error(errorObj);
      });
  }

  return (
    <React.Fragment>
      <section>
        <input ref={inputRef} placeholder={"enter show here"} />
        <button onClick={btnHandler}>Fetch Media</button>
      </section>
      <section>
        {poster.length === 0 ? "" : <img src={poster[0]}></img>}
      </section>
    </React.Fragment>
  );
}

export default App;
