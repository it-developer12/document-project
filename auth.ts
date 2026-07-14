// import NextAuth from "next-auth";
// import Keycloak from "next-auth/providers/keycloak";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Keycloak({
//       issuer: process.env.KEYCLOAK_ISSUER,
//       clientId: process.env.KEYCLOAK_CLIENT_ID,
//       clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   trustHost: true,
// });