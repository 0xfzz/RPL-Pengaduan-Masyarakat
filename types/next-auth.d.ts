import NextAuth, {DefaultUser} from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
        id: number,
        email: string,
        nama: string,
        role: string
    }
  }
  interface User extends DefaultUser {
    id: number
  }
}