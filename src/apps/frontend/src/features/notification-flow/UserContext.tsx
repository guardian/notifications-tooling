import { createContext } from "react";
import type { UserData } from "./types";

export const UserContext = createContext<UserData|undefined>(undefined)

