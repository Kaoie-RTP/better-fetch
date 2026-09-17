//#region src/index.ts
const fetcher = (() => {
	function buildUrl(base, path, query) {
		const urlString = path || "";
		const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+-.]*:\/\//.test(urlString);
		let url;
		if (hasProtocol) url = new URL(urlString);
		else {
			let baseUrl = base ? base.toString() : typeof location !== "undefined" ? location.origin : "http://localhost";
			if (!baseUrl.endsWith("/")) baseUrl += "/";
			url = new URL(urlString.replace(/^\//, ""), baseUrl);
		}
		if (query) {
			for (const [key, value] of Object.entries(query)) if (value !== void 0 && value !== null) url.searchParams.append(key, String(value));
		}
		return url.toString();
	}
	function request(method, pathOrUrl, payload, options, globalOptions) {
		const opts = Object.assign({}, globalOptions, options);
		const headers = new Headers(globalOptions?.headers);
		if (opts.headers) new Headers(opts.headers).forEach((v, k) => {
			headers.set(k, v);
		});
		let body = void 0;
		if (payload !== void 0 && payload !== null && method !== "GET" && method !== "HEAD") {
			if (typeof payload === "object" && !(payload instanceof FormData) && !(payload instanceof Blob)) {
				body = JSON.stringify(payload);
				if (!headers.has("content-type")) headers.set("content-type", "application/json");
			} else body = payload;
		}
		const url = buildUrl(opts.base, pathOrUrl, opts.query);
		const fetchFunction = opts.fetch || (typeof fetch !== "undefined" ? fetch : null);
		if (!fetchFunction) throw new Error("Fetch API not available");
		const requestInit = Object.assign({}, opts, {
			method,
			headers,
			body
		});
		return Promise.resolve().then(() => {
			if (opts.beforeRequest) return opts.beforeRequest(requestInit);
		}).then(() => fetchFunction(url, requestInit)).then((response) => {
			if (opts.afterResponse) return Promise.resolve(opts.afterResponse(response)).then((modifiedResponse) => modifiedResponse || response);
			return response;
		}).then((response) => {
			if (!response.ok && opts.throwOnError !== false) throw Object.assign(new Error(response.statusText || `HTTP Error ${response.status}`), {
				status: response.status,
				response
			});
			if (opts.parse === false) return response;
			return response[opts.parse || "json"]().catch(() => null);
		});
	}
	return (defaultOptions) => {
		const globalOptions = defaultOptions || {};
		return {
			get: (url, options) => request("GET", url, void 0, options, globalOptions),
			post: (url, payload, options) => request("POST", url, payload, options, globalOptions),
			put: (url, payload, options) => request("PUT", url, payload, options, globalOptions),
			patch: (url, payload, options) => request("PATCH", url, payload, options, globalOptions),
			delete: (url, options) => request("DELETE", url, void 0, options, globalOptions),
			raw: (method, url, payload, options) => request(method.toUpperCase(), url, payload, options, globalOptions)
		};
	};
})();
//#endregion
export { fetcher as default };
