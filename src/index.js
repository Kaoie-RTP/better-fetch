var fetcher = (function () {
  /**
   * @param {string | URL} [base]
   * @param {string} [path]
   * @param {Record<string, any>} [query]
   */
  function buildUrl(base, path, query) {
    var urlStr = path || '';
    var hasProtocol = /^[a-zA-Z][a-zA-Z0-9+-.]*:\/\//.test(urlStr);

    /** @type {URL} */
    var url;
    if (hasProtocol) {
      url = new URL(urlStr);
    } else {
      var baseUrl = base
        ? base.toString()
        : typeof location !== 'undefined'
          ? location.origin
          : 'http://localhost';
      if (!baseUrl.endsWith('/')) baseUrl += '/';
      url = new URL(urlStr.replace(/^\//, ''), baseUrl);
    }

    if (query) {
      Object.keys(query).forEach(function (k) {
        if (query[k] !== undefined && query[k] !== null) {
          url.searchParams.append(k, query[k]);
        }
      });
    }

    return url.toString();
  }

  /**
   * @param {string} method
   * @param {string} [pathOrUrl]
   * @param {any} [payload]
   * @param {import('./index').FetchOptions} [options]
   * @param {import('./index').FetchOptions} [globalOptions]
   * @returns {Promise<any>}
   */

  function request(method, pathOrUrl, payload, options, globalOptions) {
    var opts = Object.assign({}, globalOptions, options);
    var headers = new Headers(globalOptions.headers);

    if (opts.headers) {
      new Headers(opts.headers).forEach(function (v, k) {
        headers.set(k, v);
      });
    }

    var body = payload;
    if (
      payload !== undefined &&
      payload !== null &&
      method !== 'GET' &&
      method !== 'HEAD'
    ) {
      // Parse to JSON if payload is object or array (except FormData/Blob)
      if (
        typeof payload === 'object' &&
        !(payload instanceof FormData) &&
        !(payload instanceof Blob)
      ) {
        body = JSON.stringify(payload);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    } else {
      body = undefined;
    }

    var url = buildUrl(opts.base, pathOrUrl, opts.query);
    var fetchFunction =
      opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

    if (!fetchFunction) throw new Error('Fetch API not available');

    var requestInit = Object.assign({}, opts, {
      method: method,
      headers: headers,
      body: body,
    });

    return Promise.resolve()
      .then(function () {
        if (opts.beforeRequest) return opts.beforeRequest(requestInit);
      })
      .then(function () {
        return fetchFunction(url, requestInit);
      })
      .then(function (response) {
        if (opts.afterResponse) {
          return Promise.resolve(opts.afterResponse(response)).then(
            function (modifiedResponse) {
              return modifiedResponse || response;
            },
          );
        }
        return response;
      })
      .then(function (response) {
        if (!response.ok && opts.throwOnError !== false) {
          var error = Object.assign(
            new Error(response.statusText || 'HTTP Error ' + response.status),
            {
              status: response.status,
              response: response,
            },
          );
          throw error;
        }

        if (opts.parse === false) return response;
        var parseType = opts.parse || 'json';

        return response[parseType]().catch(function () {
          return null;
        });
      });
  }

  /**
   * @param {import('./index').FetchOptions} [defaultOptions]
   * @returns {import('./index').HttpClient}
   */
  return function (defaultOptions) {
    var globalOptions = defaultOptions || {};
    return {
      get: function (url, options) {
        return request('GET', url, undefined, options, globalOptions);
      },
      post: function (url, payload, options) {
        return request('POST', url, payload, options, globalOptions);
      },
      put: function (url, payload, options) {
        return request('PUT', url, payload, options, globalOptions);
      },
      patch: function (url, payload, options) {
        return request('PATCH', url, payload, options, globalOptions);
      },
      delete: function (url, options) {
        return request('DELETE', url, undefined, options, globalOptions);
      },
      raw: function (method, url, payload, options) {
        return request(
          method.toUpperCase(),
          url,
          payload,
          options,
          globalOptions,
        );
      },
    };
  };
})();

// For CommonJS / Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = fetcher;
}
