import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ref,
  onValue,
  set,
  push,
  query,
  orderByChild,
  limitToLast,
  DatabaseReference,
} from "firebase/database";
import sessionId from "./sessionId";
import { database } from "./firebase";

// interface Vote {
//   voteId: string;
//   dateCreated: string;
//   userId: string;
//   value: boolean;
// }

// interface Scene {
//   dateCreated: string;
//   id: string;
//   votes: Vote[];
// }

// interface Show {
//   dateCreated: string;
//   dateFinished?: string | null;
//   id: string;
//   scenes: Scene[];
// }

// type Shows = Show[];

// type State =
//   | { state: "LOADING" }
//   | { state: "ERROR"; error: Error }
//   | {
//       state: "DATA";
//       payload:
//         | { type: "WAITING_TO_START" }
//         | {
//             type: "VOTING";
//             payload: {
//               positive: number;
//               negative: number;
//               userVote: boolean | null;
//               handleVote: (vote: boolean) => void;
//             };
//           }
//         | { type: "FINISHED" };
//     };

// const lastShowRef =  query(ref(database, 'shows'), orderByChild('dateCreated'), limitToFirst(1));

// function useLastShow(): { show: Show; finishCurrentShow: () => void } | { createNewShow: () => void } {
//   const [lastShow, setLastShow] = React.useState<Show | null>(null);

//   React.useEffect(() => {
//     const unsubscribe = onValue(lastShowRef, (snapshot) => {
//       const data = snapshot.val();

//       if (!data) {
//         setLastShow(null);

//         // TODO: Handle error

//         return;
//       }

//       setLastShow(data);
//     });

//     return () => {
//       setLastShow(null);
//       unsubscribe();
//     };
//   }, []);

//   React.useEffect(() => {
//     return onValue(activeShowRef, (snapshot) => {
//       const data: unknown = snapshot.val();

//       if (typeof data !== "string") {
//         setActiveShowId(null);

//         // TODO: Handle error

//         return;
//       }

//       setActiveShowId(data);
//     });
//   }, []);

//   return {
//     show,
//     setNewActiveShow: React.useCallback(() => {
//       const newActiveShowId = uuidv4();
//       const newShow = set(activeShowRef, newActiveShowId);
//       set(getShowRef(newActiveShowId));
//       setActiveShowId(newActiveShowId);
//     }, []),
//   };
// }

// export function useData(): State {
//   const [activeShow, setActiveShow] = React.useState<string | null>(null);
//   const [state, setState] = React.useState<State>({ state: "LOADING" });

//   React.useEffect(() => {
//     return onValue(activeShowRef, (snapshot) => {
//       const data: unknown = snapshot.val();

//       if (typeof data !== "string") {
//         setActiveShow(null);

//         setState({
//           state: "ERROR",
//           error: new Error("Active show is not a string"),
//         });

//         return;
//       }

//       setActiveShow(data);
//     });
//   }, []);

//   return state;
// }

// export function useActions(): { reset: () => void; toggleShow: () => void } {
//   return {
//     reset: React.useCallback(() => {
//       const newActiveShowRef = uuidv4();

//       set(activeShowRef, newActiveShowRef);
//     }, []),
//     toggleShow: React.useCallback(() => {}, []),
//   };
// }

interface BaseShow {
  dateCreated: string;
  id: string;
  ref: DatabaseReference;
  // dateStarted?: string;
  // dateFinished?: string;
  // scenes: Scene[];
}

interface StartedShow extends BaseShow {
  dateStarted: string;
}

interface FinishedShow extends StartedShow {
  dateFinished: string;
}

type Show = StartedShow | FinishedShow | BaseShow;

const showsRef = ref(database, "shows");

const lastShowRef = query(
  showsRef,
  orderByChild("dateCreated"),
  limitToLast(1)
);

type Data =
  | { state: "WAITING_TO_START_SHOW"; show: BaseShow }
  | { state: "SHOW_FINISHED"; show: FinishedShow }
  | { state: "SHOW_IN_PROGRESS"; show: StartedShow }
  | { state: "NO_SHOWS"; show?: never };

function useData(): {
  actions: { reset: () => void; toggleShow: () => void };
  data: Data;
} {
  const [latestShow, setLatestShow] = React.useState<Show | null>();

  React.useEffect(() => {
    return onValue(lastShowRef, (snapshot) => {
      let data: undefined | Show;

      snapshot.forEach((action) => {
        const value: Omit<Show, "ref"> | null = action.val();
        data = value ? { ...value, ref: action.ref } : undefined;
      });

      if (!data) {
        setLatestShow(null);

        return;
      }

      console.log("Got show", data);

      setLatestShow(data);
    });
  }, []);

  const data = React.useMemo((): Data => {
    if (!latestShow) return { state: "NO_SHOWS" };

    if ("dateFinished" in latestShow) {
      return { state: "SHOW_FINISHED", show: latestShow };
    }

    if ("dateStarted" in latestShow) {
      return { state: "SHOW_IN_PROGRESS", show: latestShow };
    }

    return { state: "WAITING_TO_START_SHOW", show: latestShow };
  }, [latestShow]);

  const toggleShow = React.useCallback((): null => {
    switch (data.state) {
      case "SHOW_FINISHED": {
        const date = new Date().toISOString();

        const newShow: Omit<BaseShow, "ref"> = {
          id: uuidv4(),
          dateCreated: date,
        };

        // TODO: Loading

        push(showsRef, newShow)
          .then((ref) => {
            // TODO: Clear loading
            setLatestShow({ ...newShow, ref });
          })
          .catch((error) => {
            // TODO: clear loading and do something with error
            console.error(error);
          });

        return null;
      }
      case "NO_SHOWS": {
        const date = new Date().toISOString();

        const newShow: Omit<StartedShow, "ref"> = {
          id: uuidv4(),
          dateCreated: date,
          dateStarted: date,
        };

        // TODO: Loading

        push(showsRef, newShow)
          .then((ref) => {
            // TODO: Clear loading
            setLatestShow({ ...newShow, ref });
          })
          .catch((error) => {
            // TODO: clear loading and do something with error
            console.error(error);
          });

        return null;
      }
      case "WAITING_TO_START_SHOW": {
        const date = new Date().toISOString();

        const newShow: Omit<StartedShow, "ref"> = {
          dateCreated: data.show.dateCreated,
          dateStarted: date,
          id: data.show.id,
        };

        set(data.show.ref, newShow)
          .then(() => {
            // TODO: Clear loading
            setLatestShow({ ...newShow, ref: data.show.ref });
          })
          .catch((error) => {
            // TODO: clear loading and do something with error
            console.error(error);
          });

        return null;
      }
      case "SHOW_IN_PROGRESS": {
        const date = new Date().toISOString();

        const newShow: Omit<FinishedShow, "ref"> = {
          dateCreated: data.show.dateCreated,
          dateStarted: data.show.dateStarted,
          id: data.show.id,
          dateFinished: date,
        };

        set(data.show.ref, newShow)
          .then(() => {
            // TODO: Clear loading
            setLatestShow({ ...newShow, ref: data.show.ref });
          })
          .catch((error) => {
            // TODO: clear loading and do something with error
            console.error(error);
          });

        return null;
      }
    }
  }, [data.state, data.show]);

  return {
    actions: {
      reset: () => undefined,
      toggleShow,
    },
    data,
  };
}

export default useData;
