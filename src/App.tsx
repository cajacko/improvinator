import React from "react";
import useData from "./useData";
import Audience from "./Audience";
import Display from "./Display";

const isPerformer = window.location.search.includes("performer=true");

function App() {
  const data = useData(isPerformer);

  if (isPerformer) return <Display {...data} />;

  return <Audience {...data} />;
}

export default App;
