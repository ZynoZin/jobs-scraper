
const { parse } = require('rss-to-json');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Upwork = require('./models/upwork');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const listenToServer = require('./server.js');

listenToServer();

const transporter = nodemailer.createTransport({
	service: 'hotmail',
	auth: {
		user: `${process.env.EMAIL}`,
		pass: `${process.env.PASSWORD}`,
	},
});

const fetchData = async () => {
	const lastJobs = await Upwork.find({});
	for (let j = 0; j < lastJobs.length; j++) {
		const lastJob = lastJobs[j];
		console.log(lastJob.jobTitle);
		let rss = await parse(`https://www.upwork.com/ab/feed/jobs/rss?q=${lastJob.jobCategory}&paging=0%3B10&api_params=1&securityToken=702bfaedf43c0638fc70510c4b9c95d01cf496d7662a718c50309ee3f970690a13db0a53e9351293fd70b67d51b5bceb9ce8096ec30979f5fb4b49d7e160600d&userUid=1370358908102688768&orgUid=1370358908102688769`);
		const jobs = rss.items
		jobs.sort(function(x, y){
			return x.published - y.published;
		})
		jobs.reverse();
		const job = await Upwork.findOne({ jobTitle: jobs[0].title, jobCategory: lastJob.jobCategory });
		if (job) {
			console.log('Job already exists');
			continue;
		}
		for (let i = 0; i < 5; i++) {
			const jobPosted = jobs[i];
			if (jobPosted.title === lastJob.jobTitle ) {
				await Upwork.updateOne({ jobCategory: lastJob.jobCategory }, { jobTitle: jobs[0].title });			
				break;
			}
			const options = {
				from: `${process.env.EMAIL}`,
				to: `${process.env.RECEIVER}`,
				subject: `${jobPosted.title}`,
				html: `${jobPosted.description}\n <a href="${jobPosted.link}">${jobPosted.link}</a>`,
			};
			transporter.sendMail(options, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log(info.response);
				}
			});
			await sleep(10000);
		}
		await Upwork.updateOne({ jobCategory: lastJob.jobCategory }, { jobTitle: jobs[0].title });
	}
	return
};




mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to Database.');
		let i = 0;
		while(true) {
			console.log(`Job #${i}`);
			await fetchData();
			await sleep(60000);
			i++;
		}
	})
	.catch((err) => console.log(err));
