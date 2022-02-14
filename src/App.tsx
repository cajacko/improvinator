import React from "react";
import Button from "@mui/material/Button";
import "./App.css";
import useData from "./useData";

function App() {
  const { actions, data } = useData();

  React.useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="App">
      <header className="App-header">
        <p>State: {data.state}</p>
        <Button variant="contained" onClick={actions.reset}>
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={actions.toggleShow}
          style={{ marginTop: 10 }}
        >
          Start / Stop
        </Button>
      </header>
    </div>
  );
}

export default App;
