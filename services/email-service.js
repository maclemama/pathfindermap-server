const nodemailer = require("nodemailer");
const Email = require("email-templates");

const transporter = nodemailer.createTransport({
	host: "smtp.zoho.eu",
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

exports.send = async(from, to, template, variables) => {
	//object containing variables
	const email = new Email({
		message: {
			from: from,
		},
		send: true,
		preview: false,
		transport: transporter,
		views: {
			options: {
				extension: "ejs",
			},
		},
	});
	email
		.send({
			template: template,
			message: {
				to: to,
			},
			locals: variables,
		})
		.then((results) => {
		})
		.catch((e) => console.error(e));
};
