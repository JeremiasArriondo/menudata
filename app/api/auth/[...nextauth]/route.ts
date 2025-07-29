import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Aquí deberías validar las credenciales contra tu base de datos
        // Por ahora, usamos credenciales de ejemplo
        if (credentials.email === "admin@menudata.com" && credentials.password === "admin123") {
          return {
            id: "1",
            email: credentials.email,
            name: "Admin MenuData",
            image: null,
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecciones relativas
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Permite redirecciones al mismo origen
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }
