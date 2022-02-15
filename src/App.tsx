import React from "react";
import Button from "@mui/material/Button";
import "./App.css";
import useData from "./useData";

/**
 * 0,5 = 100%
 * 0,1 = 100%
 * 1,1 = 0%
 * 1,2 = 50%
 * 2,1 = -50%
 */
function getScore(negative: number, positive: number): number {
  if (negative === positive) return 0;
  if (negative === 0) return 1;
  if (positive === 0) return -1;

  const total = positive + negative;
  const value = positive - negative;

  return value / total;
}

function getEmoji(negative: number, positive: number): string {
  // const total = positive + negative;
  const score = getScore(negative, positive);

  if (score >= 1) return "😁";
  if (score >= 0.9) return "😃";
  if (score >= 0.6) return "😀";
  if (score >= 0.3) return "😊";
  if (score > 0) return "🙂";

  if (score === 0) return "😐";

  if (score <= -1) return "😭";
  if (score <= -0.9) return "😢";
  if (score <= -0.6) return "😨";
  if (score <= -0.3) return "😦";

  return "🙁";
}

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
            <span>{getEmoji(data.total[0], data.total[1])}</span>
            <p>
              👎 {data.total[0]} / {data.total[1]} 👍
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
