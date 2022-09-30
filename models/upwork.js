const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reqString = {
	type: String,
	required: true,
};

const upworkSchema = new Schema({
	jobTitle: reqString,
	jobCategory: reqString,
});

const Upwork = mongoose.model('Upwork', upworkSchema);

module.exports = Upwork;