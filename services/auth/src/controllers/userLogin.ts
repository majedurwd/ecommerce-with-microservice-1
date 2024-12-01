import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { UserLoginSchema } from "../schemas";
import { LoginAttempt } from "@prisma/client";

export interface LoginHistory {
	userId: string;
	ipAddress: string | undefined;
	userAgent: string | undefined;
	attempt: LoginAttempt;
}

const createLoginHistory = async (info: LoginHistory) => {
	await prisma.loginHistory.create({
		data: {
			userId: info.userId,
			ipAddress: info.ipAddress,
			userAgent: info.userAgent,
			attempt: info.attempt,
		},
	});
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ipAddress =
			(req.headers["x-forwarded-for"] as string) || req.ip || "";
		const userAgent = req.headers["user-agent"] || "";

		const parsedBody = UserLoginSchema.safeParse(req.body);
		if (!parsedBody.success) {
			return res.status(400).json({
				message: "Request body validation faild",
				error: parsedBody.error.errors,
			});
		}

		// Check if the user exists
		const user = await prisma.user.findUnique({
			where: { email: parsedBody.data.email },
		});
		if (!user) {
			await createLoginHistory({
				userId: "Geust",
				ipAddress,
				userAgent,
				attempt: "FAILD",
			});
			return res.status(400).json({ message: "Invalid creadential" });
		}

		// Compare password
		const isMatch = await bcrypt.compare(
			parsedBody.data.password,
			user.password
		);
		if (!isMatch) {
			await createLoginHistory({
				userId: user.id,
				ipAddress,
				userAgent,
				attempt: "FAILD",
			});
			return res.status(400).json({ message: "Invalid creadential" });
		}

		// Check if the user is verified
		if (!user.verified) {
			await createLoginHistory({
				userId: user.id,
				ipAddress,
				userAgent,
				attempt: "FAILD",
			});
			return res.status(400).json({ message: "User not verified" });
		}

		// Check if the account is active
		if (user.status !== "ACTIVE") {
			await createLoginHistory({
				userId: user.id,
				ipAddress,
				userAgent,
				attempt: "FAILD",
			});
			return res.status(400).json({ message: "Account not active" });
		}

		// Generate access token
		const accessToken = jwt.sign(
			{
				userId: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			process.env.JWT_SECRET || "My_jwt_secret",
			{ expiresIn: "2h" }
		);

		await createLoginHistory({
			userId: user.id,
			ipAddress,
			userAgent,
			attempt: "SUCCESS",
		});

		return res.status(200).json(accessToken);
	} catch (error) {
		next(error);
	}
};

export default userLogin;
