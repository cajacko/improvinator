import React from "react";
import MuiButton, { ButtonProps } from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import styled from "styled-components";
import { Data } from "./useData";
import getEmoji from "./getEmoji";

const Container = styled.div`
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
  font-size: 100px;
  margin-bottom: 0px;
`;

const Stats = styled(Typography)`
  font-size: 30px;
  color: white;
`;

const Text = styled(Typography)`
  font-size: 18px;
  color: white;
  text-align: center;
`;

const VoteContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const VoteData = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 60px;
  margin-top: 10px;
`;

const Button = styled(MuiButton)<{ $isSelected: boolean } & ButtonProps>`
  flex: 1;
  display: flex;
  opacity: ${({ $isSelected }) => ($isSelected ? 0.5 : 1)};
`;

function App(data: Data) {
  return (
    <Container>
      {data.showStatus === "WAITING" && (
        <Wrapper>
          <Text>Get ready for the show!</Text>
        </Wrapper>
      )}
      {data.showStatus === "FINISHED" && (
        <Wrapper>
          <Text>That's all folk! Thanks for coming!</Text>
        </Wrapper>
      )}
      {data.showStatus === "IN_PROGRESS" && (
        <VoteContainer>
          <VoteData>
            <Emoji>{getEmoji(data.total[0], data.total[1])}</Emoji>
            <Stats>
              👎 {data.total[0]} / {data.total[1]} 👍
            </Stats>
          </VoteData>

          <Footer>
            <Text>How do you want this scene to end?</Text>

            <Buttons>
              <Button
                variant="contained"
                color="error"
                $isSelected={data.yourVote === false}
                onClick={() =>
                  data.yourVote === false ? undefined : data.vote(false)
                }
              >
                {data.yourVote === false
                  ? "You chose negative"
                  : data.yourVote === true
                  ? "Switch to negative"
                  : "Negatively"}
              </Button>
              <Button
                variant="contained"
                color="success"
                $isSelected={data.yourVote === true}
                onClick={() =>
                  data.yourVote === true ? undefined : data.vote(true)
                }
              >
                {data.yourVote === true
                  ? "You chose positive"
                  : data.yourVote === false
                  ? "Switch to positive"
                  : "Positively"}
              </Button>
            </Buttons>
          </Footer>
        </VoteContainer>
      )}
    </Container>
  );
}

export default App;
