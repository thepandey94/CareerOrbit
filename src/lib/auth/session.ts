import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "../env";

export interface SessionUser {
  id: string;
  email: string;
  userId: string;
  fullName: string;
  role: "STUDENT" | "ADMIN";
  accountStatus: "ACTIVE" | "PENDING_DELETION";
}

export interface SessionData {
  user?: SessionUser;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: "careerorbit_session",
  cookieOptions: {
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
