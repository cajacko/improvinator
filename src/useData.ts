import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ref, onValue, set, push } from "firebase/database";
import sessionId from "./sessionId";
import { database } from "./firebase";

interface Vote {
  dateCreated: string;
  value: boolean;
  sessionId: string;
}

interface StartedScene {
  id: string;
  dateCreated: string;
}

interface FinishedScene extends StartedScene {
  dateFinished: string;
}

type Scene = StartedScene | FinishedScene;

interface StartedShow {
  id: string;
  dateCreated: string;
  scenes: string[];
}

interface FinishedShow extends StartedShow {
  dateFinished: string;
}

type Show = StartedShow | FinishedShow;

const currentShowIdRef = ref(database, "currentShowId");

function getShowRef(showId: string) {
  return ref(database, `show/${showId}`);
}

function getSceneRef(sceneId: string) {
  return ref(database, `scene/${sceneId}`);
}

function getVotesRef(sceneId: string) {
  return ref(database, `votes/${sceneId}`);
}

export type Data =
  | { showStatus: "WAITING"; startShow: () => void }
  | {
      showStatus: "FINISHED";
      clearShow: () => void;
      continueShow: () => void;
    }
  | {
      showStatus: "IN_PROGRESS";
      yourVote: boolean | null;
      total: [number, number];
      vote: (value: boolean) => void;
      nextScene: () => void;
      finishShow: () => void;
    };

function useData(isPerformer: boolean): Data {
  const [currentShowId, setCurrentShowId] = React.useState<string | null>(null);
  const [show, setShow] = React.useState<Show | null>(null);
  const [scene, setScene] = React.useState<Scene | null>(null);
  const [votes, setVotes] = React.useState<Vote[] | null>(null);

  const showRef = React.useMemo(
    () => (currentShowId ? getShowRef(currentShowId) : null),
    [currentShowId]
  );

  const latestScene = show?.scenes[0];

  const sceneRef = React.useMemo(
    () => (latestScene ? getSceneRef(latestScene) : null),
    [latestScene]
  );

  const votesRef = React.useMemo(
    () => (latestScene ? getVotesRef(latestScene) : null),
    [latestScene]
  );

  React.useEffect(() => {
    const unsubscribe = onValue(currentShowIdRef, (snapshot) => {
      const data: unknown = snapshot.val();

      if (typeof data !== "string") {
        setCurrentShowId(null);

        return;
      }

      setCurrentShowId(data);
    });

    return () => {
      setCurrentShowId(null);
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!showRef) return () => setShow(null);

    const unsubscribe = onValue(showRef, (snapshot) => {
      const data: unknown = snapshot.val();

      if (!data) {
        setShow(null);

        return;
      }

      setShow(data as Show);
    });

    return () => {
      setShow(null);
      unsubscribe();
    };
  }, [showRef]);

  React.useEffect(() => {
    if (!sceneRef) return () => setScene(null);

    const unsubscribe = onValue(sceneRef, (snapshot) => {
      const data: unknown = snapshot.val();

      if (!data) {
        setScene(null);

        return;
      }

      setScene(data as Scene);
    });

    return () => {
      setScene(null);
      unsubscribe();
    };
  }, [sceneRef]);

  React.useEffect(() => {
    if (!votesRef) return () => setVotes(null);

    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data: Vote[] = [];

      snapshot.forEach((action) => {
        data.push(action.val());
      });

      if (!data) {
        setVotes(null);

        return;
      }

      setVotes(data as Vote[]);
    });

    return () => {
      setVotes(null);
      unsubscribe();
    };
  }, [votesRef]);

  const data = React.useMemo((): Data => {
    if (show) {
      if ("dateFinished" in show) {
        return {
          showStatus: "FINISHED",
          clearShow: async () => {
            await set(currentShowIdRef, null);
          },
          continueShow: async () => {
            const date = new Date().toISOString();
            const sceneId = uuidv4();

            const newScene: StartedScene = {
              id: sceneId,
              dateCreated: date,
            };

            const updatedScene: FinishedScene | null = scene
              ? {
                  ...scene,
                  dateFinished: date,
                }
              : null;

            const updatedShow: StartedShow = {
              dateCreated: show.dateCreated,
              id: show.id,
              scenes: [sceneId, ...show.scenes],
            };

            // TODO: Loading and errors
            await set(getSceneRef(newScene.id), newScene);
            await set(getShowRef(updatedShow.id), updatedShow);

            if (updatedScene) {
              await set(getSceneRef(updatedScene.id), updatedScene);
            }
          },
        };
      }

      const defaultMap: {
        [K: string]: { dateCreated: number; value: boolean };
      } = {};

      const map = votes
        ? votes.reduce((accumulator, vote) => {
            const date = new Date(vote.dateCreated).getTime();
            const previousDate = accumulator[vote.sessionId]?.dateCreated;

            if (previousDate && previousDate > date) return accumulator;

            return {
              ...accumulator,
              [vote.sessionId]: {
                dateCreated: date,
                value: vote.value,
              },
            };
          }, defaultMap)
        : defaultMap;

      let positive: number = 0;
      let negative: number = 0;

      Object.values(map).forEach(({ value }) => {
        if (value) {
          positive += 1;
        } else {
          negative += 1;
        }
      });

      return {
        showStatus: "IN_PROGRESS",
        total: [negative, positive],
        yourVote: map[sessionId]?.value ?? null,
        finishShow: async () => {
          const date = new Date().toISOString();

          const updatedScene: FinishedScene | null = scene
            ? {
                ...scene,
                dateFinished: date,
              }
            : null;

          const updatedShow: FinishedShow = {
            ...show,
            dateFinished: date,
          };

          // TODO: Loading and errors
          await set(getShowRef(updatedShow.id), updatedShow);

          if (updatedScene) {
            await set(getSceneRef(updatedScene.id), updatedScene);
          }
        },
        nextScene: async () => {
          const date = new Date().toISOString();
          const sceneId = uuidv4();

          const newScene: StartedScene = {
            id: sceneId,
            dateCreated: date,
          };

          const updatedScene: FinishedScene | null = scene
            ? {
                ...scene,
                dateFinished: date,
              }
            : null;

          const updatedShow: StartedShow = {
            ...show,
            scenes: [sceneId, ...show.scenes],
          };

          // TODO: Loading and errors
          await set(getSceneRef(newScene.id), newScene);
          await set(getShowRef(updatedShow.id), updatedShow);

          if (updatedScene) {
            await set(getSceneRef(updatedScene.id), updatedScene);
          }
        },
        vote: (value) => {
          if (!votesRef) {
            // TODO: Don't let this happen;

            return;
          }

          const date = new Date().toISOString();

          const vote: Vote = {
            dateCreated: date,
            sessionId,
            value,
          };

          push(votesRef, vote);
        },
      };
    }

    return {
      showStatus: "WAITING",
      startShow: async () => {
        const date = new Date().toISOString();
        const sceneId = uuidv4();
        const showId = uuidv4();

        const newScene: StartedScene = {
          id: sceneId,
          dateCreated: date,
        };

        const newShow: StartedShow = {
          id: showId,
          dateCreated: date,
          scenes: [sceneId],
        };

        // TODO: Loading and errors
        await set(getSceneRef(sceneId), newScene);
        await set(getShowRef(showId), newShow);
        await set(currentShowIdRef, showId);
      },
    };
  }, [scene, show, votes, votesRef]);

  React.useEffect(() => {
    if (!isPerformer) return;

    // TODO: Debounce
    const listener = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
          switch (data.showStatus) {
            case "FINISHED":
              return data.clearShow();
            case "IN_PROGRESS":
              return data.finishShow();
            case "WAITING":
              return data.startShow();
            default:
              return;
          }
        case " ": {
          switch (data.showStatus) {
            case "FINISHED":
              return data.continueShow();
            case "IN_PROGRESS":
              return data.nextScene();
            case "WAITING":
            default:
              return;
          }
        }
        default:
          return;
      }
    };

    const event = "keydown";

    document.addEventListener(event, listener);

    return () => {
      document.removeEventListener(event, listener);
    };
  }, [data, isPerformer]);

  return data;
}

export default useData;
