import { v4 as uuidv4 } from "uuid";

const key = "IMPROVINATOR/USER_ID";

function getId() {
  const id = window.localStorage.getItem(key);

  if (id) return id;

  const newId = uuidv4();

  window.localStorage.setItem(key, newId);

  return newId;
}

const id = getId();

export default id;
