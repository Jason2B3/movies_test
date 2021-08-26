import React, { useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [poster, setPoster] = useState([]);
  const inputRef = React.useRef("nothing");

  const btnHandler = async function (e) {
    const showInfo = await showResearch(inputRef.current.value); // will equal the return obj at end
    console.log(showInfo);
    inputRef.current.value = ""; // clear input fields
  };

  async function showResearch(query) {
    try {
      const result = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${query}`
      );
      if (!result.ok) throw new Error("No shows found in the search results"); 
      const parsedData = await result.json();
      console.log(parsedData);
      setPoster((prevState) => [parsedData.image.medium]);
      return {
        // Time to rename shit!
        showID: parsedData.id,
        title: parsedData.name,
        score: parsedData.rating.average,
        genre: parsedData.type,
      };
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
