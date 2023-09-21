import { db } from "@/lib/db"
import { hash } from "bcrypt"
import { NextResponse } from "next/server"
import * as z from 'zod';


//define schema for input validation
const userSchema = z.object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have than 8 characters'),
  });

export async function POST(req: Request){
    try {
        const body = await req.json()
        const {email,username,password} = userSchema.parse(body)

        //check if email exists
        const existingEmail = await db.user.findUnique({
            where: {email: email}
        })
        if (existingEmail) {
            return NextResponse.json({user: null, messege: 'User with this Email already exists'}, {status: 409})
        } 

         //check if username exists
        const existingUsername = await db.user.findUnique({
            where: {username: username}
        })
        if (existingUsername) {
            return NextResponse.json({user: null, messege: 'User with this Username already exists'}, {status: 409})
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await db.user.create({
            data:{
                username,
                email,
                password: hashedPassword
            }
        })

        const {password: newUserPassword, ...data} = newUser

        return NextResponse.json({user: data, messege: 'user created successfully'}, {status:200})
    } catch (error) {
        return NextResponse.json({messege: 'Could not create user'}, {status:500})
    }
}