import React from "react";
import useData from "./useData";
import Audience from "./Audience";
import Display from "./Display";

const performerQuery = "performer=true";
const isPerformer = window.location.search.includes(performerQuery);

const invisibleButtonThreshold = 5;

function App() {
  const data = useData(isPerformer);
  const [invisibleButtonCount, setInvisibleButtonCount] = React.useState(0);
  const invisibleButtonHasMetThreshold =
    invisibleButtonCount >= invisibleButtonThreshold;
  const shouldResetCount =
    invisibleButtonCount !== 0 && !invisibleButtonHasMetThreshold;

  const handleInvisibleButton = React.useCallback(() => {
    if (invisibleButtonHasMetThreshold) {
      console.log("invisible button threshold met");
      setInvisibleButtonCount(0);
      window.location.href = `${window.location.origin}${window.location.pathname}?${performerQuery}`;
    } else {
      console.log("invisible button pressed");
      setInvisibleButtonCount(invisibleButtonCount + 1);
    }
  }, [invisibleButtonCount, invisibleButtonHasMetThreshold]);

  React.useEffect(() => {
    if (!shouldResetCount) return;

    const timeout = setTimeout(() => {
      console.log("clear invisible button");
      setInvisibleButtonCount(0);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [shouldResetCount]);

  if (isPerformer) return <Display {...data} />;

  return <Audience handleInvisibleButton={handleInvisibleButton} {...data} />;
}

export default App;
