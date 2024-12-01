import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { EmailCreateSchema } from "../schemas";
import { defaultSender, transporter } from "../config";

const sendMail = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Validate the request body
		const parsedBody = EmailCreateSchema.safeParse(req.body);
		if (!parsedBody.success) {
			return res.status(400).json({
				message: "Request body validation faild",
				error: parsedBody.error.errors,
			});
		}

		// Create mail option
		const { recipient, subject, body, source, sender } = parsedBody.data;
		const from = sender || defaultSender;
		const emailOption = {
			from,
			to: recipient,
			subject,
			text: body,
		};

		// send the mail
		const { rejected } = await transporter.sendMail(emailOption);
		if (rejected.length) {
			console.log("Email rejected", rejected);
			return res.status(500).json({ message: "Faild" });
		}

		await prisma.email.create({
			data: {
				sender: from,
				recipient,
				subject,
				body,
				source,
			},
		});

		return res.status(200).json({ message: "Email sent" });
	} catch (error) {
		next(error);
	}
};
export default sendMail;
