import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session:{
        strategy:'jwt'
    },
    pages: {
        signIn: '/sign-in'
    },
    
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
            email: { label: "Email", type: "email", placeholder: "jsmith@mail.com" },
            password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error('invalid email or password')
                }
            const existingUser = await db.user.findUnique({
                where: {email: credentials?.email}
            })
            if(!existingUser){
                throw new Error('invalid email or password')
            }
            const passwordMatch = await compare(credentials.password, existingUser.password)
            if (!passwordMatch) {
                throw new Error('invalid email or password')
            }

            return {
                id: `${existingUser.id}`,
                username: existingUser.username,
                email: existingUser.email,
            }
            }
        })
    ],
}
export default NextAuth(authOptions)