import React, { useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [poster, setPoster] = useState([]);
  const inputRef = React.useRef("nothing");

  const btnHandler = function (e) {
    showResearch(inputRef.current.value);
    inputRef.current.value = "";
  };
  const [showData, setShowData] = useState({});
  async function showResearch(query) {
    try {
      const result = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${query}`
      );
      if (!result.ok) throw new Error("No shows found in the search results"); // don't forget
      const parsedData = await result.json();
      console.log(parsedData);
      setPoster((prevState) => [parsedData.image.medium]);
    } catch (errorObj) {
      alert(errorObj);
      console.error(errorObj);
    }
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
