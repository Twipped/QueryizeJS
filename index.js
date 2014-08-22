var fs = require('fs');
var dox = require('dox');
var Handlebars = require('handlebars');

var template = Handlebars.compile(fs.readFileSync(__dirname + '/template.hbs.html').toString('utf8'));

var src = fs.readFileSync(__dirname + '/../queryize.js');
var parsed = dox.parseComments(src.toString('utf8'));

var parents = {};
var parentless = {
	categories: {},
	uncategorized: []
};

parsed.forEach(function (item, index) {
	if (!item.ctx) {
		// If there's no context, then it's an extra chunk we don't care about
		item.ignore = true;
		return;
	}

	item.signatures = [];
	item.aliases = [];

	var currentSignature;

	function addSignature () {
		if (!currentSignature) return; //nothing to add

		if (!currentSignature.signature) {
			currentSignature.signature =
				(item.ctx.parent + '.' || '') +
				item.ctx.name + '(' +
				currentSignature.params.map(function (p) {return p.optional ? '['+p.name+']' : p.name;}).join(', ') +
				')';
		}

		item.signatures.push(currentSignature);
	}

	function ensureSignature () {
		if (!currentSignature) {
			currentSignature = {
				signature: '',
				params: [],
				examples: [],
				returns: ''
			};
		}
	}

	// process tags
	item.tags.forEach(function (tag) {
		var i;
		switch (tag.type) {
		case 'name':
			item.ctx.name = tag.string;
			break;
		case 'memberOf':
			item.ctx.parent = tag.parent;
			break;
		case 'category':
			item.category = tag.string.trim();
			break;
		case 'alias':
			item.aliases.push(tag.string);
			break;


		case 'param':
			ensureSignature();

			if ((tag.optional = tag.name[0] == '[')) {
				tag.name = tag.name.substring(1, tag.name.length -1);
			}

			i = tag.name.indexOf('=');
			if (i>0) {
				tag.default = tag.name.substring(i+1);
				tag.name = tag.name.substring(0, i);
			}

			tag.types = tag.types.join(', ');

			currentSignature.params.push(tag);
			break;
		case 'signature':
			addSignature();
			currentSignature = {
				signature: tag.string,
				params: [],
				examples: []
			};
			break;
		case 'example':
			ensureSignature();
			currentSignature.examples.push(tag.string.trim());
			break;
		case 'returns':
			ensureSignature();
			currentSignature.returns = tag.string;
			break;
		}
	});

	// If no signature was ever created, then make one up using the function header
	if (!currentSignature) {
		ensureSignature();
		currentSignature.signature = (item.ctx.parent && item.ctx.parent + '.' || '') + item.ctx.string;
	}

	// add any left over signature
	addSignature();

	// we don't care about declarations
	if (item.ctx.type === 'declaration') {
		item.ignore = true;
	}

	// convert code tabs to spaces
	item.code = item.code.replace(/\t/g, '  ');

	// generate the name and id for the template
	item.name = (item.ctx.parent && item.ctx.parent + '.' || '') + item.ctx.name;
	item.id = item.ctx.type + (item.ctx.parent && item.ctx.parent || '') + item.ctx.name;

	// Find which parent the function belongs to
	var parentBranch;
	if (item.ctx.parent) {
		parentBranch = parents[item.ctx.parent] || (parents[item.ctx.parent] = {
			name: item.ctx.parent || '',
			categories: {},
			uncategorized: []
		});
	} else {
		parentBranch = parentless;
	}

	// If the function is categorized, find its category
	var category;
	if (item.category) {
		category = parentBranch.categories[item.category] || (parentBranch.categories[item.category] = []);
	} else {
		category = parentBranch.uncategorized;
	}

	category.push(item);

	item.aliases.forEach(function (alias) {
		var achunk = Object.create(item);
		achunk.name = (item.ctx.parent && item.ctx.parent + '.' || '') + alias;
		achunk.original = item.name;
		achunk.isAlias = true;
		category.push(achunk);
	});
});


// Save the documentation data for reference
fs.writeFileSync(__dirname + '/queryize.json', JSON.stringify(parsed, undefined, 2));

fs.writeFileSync(__dirname + '/index.html', template({pieces: parsed, parents: parents, parentless: parentless}));