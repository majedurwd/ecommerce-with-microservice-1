import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const getEmails = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const emails = await prisma.email.findMany();
		return res.status(200).json(emails);
	} catch (error) {
		next(error);
	}
};

export default getEmails;
