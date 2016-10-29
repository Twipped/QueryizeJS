'use strict';

var fs = require('fs');
var dox = require('dox');
var Handlebars = require('handlebars');
var commonmark = require('commonmark');
var path = require('path');

var template = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/template.hbs.html')).toString('utf8'));

/** Build Changelog
*******************************************************************************************/
var changelog = fs.readFileSync(path.join(__dirname, '/../CHANGELOG.md')).toString('utf8');
changelog = (new commonmark.Parser()).parse(changelog);
var walker = changelog.walker();
var event;
var node;
while ((event = walker.next())) {
	node = event.node;
	if (node.t === 'SetextHeader' && node.level === 1) {
		node.level = 3;
	}
}
changelog = (new commonmark.HtmlRenderer()).render(changelog);

/** Build Docs
*******************************************************************************************/

var parsed = dox.parseComments(
	fs.readFileSync(
		path.join(__dirname, '/../lib/queryize.js')
	).toString('utf8')
);

parsed = parsed.concat(
	dox.parseComments(
		fs.readFileSync(
			path.join(__dirname, '/../lib/mutators.js')
		).toString('utf8')
	)
);

var parents = {};
var parentless = {
	categories: {},
	uncategorized: []
};

parsed.forEach(function (item) {
	if (!item.ctx) {
		// If there's no context, then it's an extra chunk we don't care about
		item.ignore = true;
		return;
	}

	item.signatures = [];
	item.aliases = [];

	var currentSignature;

	function addSignature () {
		if (!currentSignature) return; // nothing to add

		if (!currentSignature.signature) {
			currentSignature.signature =
				(item.ctx.parent && item.ctx.parent + '.' || '') +
				item.ctx.name + '(' +
				currentSignature.params.map((p) => p.optional ? '[' + p.name + ']' : p.name).join(', ') +
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
		case 'constructor':
			item.isConstructor = true;
			break;
		case 'abstract':
			item.isAbstract = true;
			break;
		case 'deprecated':
			item.isDeprecated = tag.string;
			break;

		case 'param':
			ensureSignature();

			if ((tag.optional = tag.name[0] === '[')) {
				tag.name = tag.name.substring(1, tag.name.length - 1);
			}

			i = tag.name.indexOf('=');
			if (i > 0) {
				tag.default = tag.name.substring(i + 1);
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
		case 'return':
			ensureSignature();
			tag.types = tag.types.join(', ');
			currentSignature.returns = tag;
			break;
		}
	});

	// If no signature was ever created, then make one up using the function header
	if (!currentSignature) {
		ensureSignature();
		currentSignature.signature = (item.ctx.parent && item.ctx.string.indexOf(item.ctx.parent) !== 0 && item.ctx.parent + '.' || '') + item.ctx.string;
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
	} else if (item.isConstructor) {
		parents[item.ctx.name] = {
			name: item.ctx.name,
			categories: {},
			uncategorized: [],
			item: item
		};
		return;
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

	item.aliases = item.aliases.join(', ');
});

// Save the documentation data for reference
fs.writeFileSync(path.join(__dirname, '/queryize.json'), JSON.stringify(parsed, undefined, 2));

fs.writeFileSync(path.join(__dirname, '/index.html'), template({ pieces: parsed, parents, parentless, changelog }));
