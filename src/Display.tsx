import React from "react";
import Typography from "@mui/material/Typography";
import styled from "styled-components";
import { Data } from "./useData";
import getEmoji, { getScore } from "./getEmoji";

const Container = styled.div<{ value: number }>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  display: flex;
  /* background: black; */
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #051010;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Emoji = styled.span`
  font-size: 500px;
  margin-bottom: 20px;
`;

const Stats = styled(Typography)`
  font-size: 100px;
  color: white;
`;

const Text = styled(Typography)`
  font-size: 100px;
  color: white;
  text-align: center;
  padding: 40px;
`;

const InvisibleButton = styled.button`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 9999;
  opacity: 0;
`;

function Display(data: Data) {
  const value =
    data.showStatus === "IN_PROGRESS"
      ? getScore(data.total[0], data.total[1])
      : 0;

  const rightAction = React.useCallback((): null => {
    switch (data.showStatus) {
      case "FINISHED":
        data.continueShow();
        return null;
      case "IN_PROGRESS":
        data.nextScene();
        return null;
      case "WAITING":
        return null;
    }
  }, [data]);

  const leftAction = React.useCallback(() => {
    switch (data.showStatus) {
      case "FINISHED":
        data.clearShow();
        return null;
      case "IN_PROGRESS":
        data.finishShow();
        return null;
      case "WAITING":
        data.startShow();
        return null;
    }
  }, [data]);

  return (
    <Container value={value}>
      <InvisibleButton style={{ left: 0 }} onClick={leftAction} />
      <InvisibleButton style={{ right: 0 }} onClick={rightAction} />
      <Wrapper>
        {data.showStatus === "WAITING" && <Text>Get ready for the show!</Text>}
        {data.showStatus === "FINISHED" && (
          <>
            <Text>That's all folk! Thanks for coming!</Text>
          </>
        )}
        {data.showStatus === "IN_PROGRESS" && (
          <>
            <Emoji>{getEmoji(data.total[0], data.total[1])}</Emoji>
            <Stats>
              👎 {data.total[0]} / {data.total[1]} 👍
            </Stats>
          </>
        )}
      </Wrapper>
    </Container>
  );
}

export default Display;
