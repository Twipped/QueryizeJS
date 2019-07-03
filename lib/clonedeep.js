/* eslint promise/no-native: 0 */

// use: clone( <thing to copy> ) returns <new copy>
module.exports = exports = function clone (o, m) {
	// return non object values
	if (typeof o !== 'object' || !o) return o;
	// m: a map of old refs to new object refs to stop recursion
	if (typeof m !== 'object' || m === null) m = new WeakMap();
	var n = m.get(o);
	if (typeof n !== 'undefined') return n;
	// shallow/leaf clone object
	var C = Object.getPrototypeOf(o).constructor;
	// TODO: specialize copies for expected built in types i.e. Date etc
	switch (C) {
	// shouldn't be copied, keep reference
	case Boolean:
	case Error:
	case Function:
	case Number:
	case Promise:
	case String:
	case Symbol:
	case WeakMap:
	case WeakSet:
		n = o;
		break;
		// array like/collection objects
	case Array:
		m.set(o, n = o.slice(0));
		// recursive copy for child objects
		n.forEach((v, i) => {
			if (typeof v === 'object') n[i] = clone(v, m);
		});
		break;
	case ArrayBuffer:
		m.set(o, n = o.slice(0));
		break;
	case DataView:
		m.set(o, n = new (C)(clone(o.buffer, m), o.byteOffset, o.byteLength));
		break;
	case Map:
	case Set:
		m.set(o, n = new (C)(clone(Array.from(o.entries()), m)));
		break;
	case Int8Array:
	case Uint8Array:
	case Uint8ClampedArray:
	case Int16Array:
	case Uint16Array:
	case Int32Array:
	case Uint32Array:
	case Float32Array:
	case Float64Array:
		m.set(o, n = new (C)(clone(o.buffer, m), o.byteOffset, o.length));
		break;
		// use built in copy constructor
	case Date:
	case RegExp:
		m.set(o, n = new (C)(o));
		break;
		// fallback generic object copy
	default:
		m.set(o, n = Object.assign(new (C)(), o));
		// recursive copy for child objects
		for (const [ k, v ] of Object.entries(n)) if (typeof v === 'object') n[k] = clone(v, m);
	}
	return n;
};
