import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* retrieve jokes from API */
  async function getJokes() {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let newJokes = [];
      let seenJokes = new Set();

      while (newJokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          newJokes.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes([...newJokes]);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  /* empty joke list, set to loading state, and then call getJokes */
  function generateNewJokes() {
    setIsLoading(true);
    setJokes([]);
    getJokes();
  }

  /* change vote for this id by delta (+1 or -1) */
  function vote(id, delta) {
    setJokes((prevJokes) => {
      const updatedJokes = prevJokes.map((j) =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      );

      // Sort the jokes array based on votes in descending order
      const sortedJokes = updatedJokes.sort((a, b) => b.votes - a.votes);
      return sortedJokes;
    });
  }

  /* useEffect to call getJokes on mount */
  useEffect(() => {
    getJokes();
  }, []);

  /* render: either loading spinner or list of sorted jokes. */
  return (
    <div className="JokeList">
      {isLoading ? (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      ) : (
        <>
          <button className="JokeList-getmore" onClick={generateNewJokes}>
            Get New Jokes
          </button>
          {jokes.map((j) => (
            <Joke
              text={j.joke}
              key={j.id}
              id={j.id}
              votes={j.votes}
              vote={vote}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default JokeList;
