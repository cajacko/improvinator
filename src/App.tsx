import React from "react";
import Button from "@mui/material/Button";
import "./App.css";
import useData from "./useData";

function App() {
  const data = useData();

  return (
    <div className="App">
      <header className="App-header">
        <p>State: {data.showStatus}</p>
        {data.showStatus === "WAITING" && (
          <Button variant="contained" onClick={data.startShow}>
            Start
          </Button>
        )}
        {data.showStatus === "FINISHED" && (
          <>
            <Button variant="contained" onClick={data.clearShow}>
              Clear Show
            </Button>
            <Button variant="contained" onClick={data.continueShow}>
              Continue Show
            </Button>
          </>
        )}
        {data.showStatus === "IN_PROGRESS" && (
          <>
            <p>
              -{data.total[0]} / +{data.total[1]}
            </p>
            <Button variant="contained" onClick={data.finishShow}>
              Finish Show
            </Button>
            <Button variant="contained" onClick={data.nextScene}>
              Next Scene
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => data.vote(true)}
              disabled={data.yourVote === true}
            >
              Positive
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => data.vote(false)}
              disabled={data.yourVote === false}
            >
              Negative
            </Button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
