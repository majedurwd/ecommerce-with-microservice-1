import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE } from "@/config";

const userRegistration = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Validate request body
		const parsedBody = UserCreateSchema.safeParse(req.body);
		if (!parsedBody.success) {
			return res.status(400).json({
				message: "Validation faild",
				error: parsedBody.error.errors,
			});
		}

		// Check if the user already exists
		const existsUser = await prisma.user.findUnique({
			where: { email: parsedBody.data.email },
		});
		if (existsUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(
			parsedBody.data.password,
			salt
		);

		// Create the auth user
		const user = await prisma.user.create({
			data: {
				...parsedBody.data,
				password: hashedPassword,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				status: true,
				verified: true,
			},
		});
		console.log("User created", user);

		// Create the user profile by calling the user service
		await axios.post(`${USER_SERVICE}/users`, {
			authUserId: user.id,
			name: user.name,
			email: user.email,
		});

		// TODO: generate verification code
		// TODO: send verification email

		return res.status(201).json(user);
	} catch (error) {
		next(error);
	}
};

export default userRegistration;
