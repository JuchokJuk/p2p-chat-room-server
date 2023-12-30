type CallbackHandler = (request: Request, params: Record<string, string>) => Promise<Response> | Response;

enum Methods {
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "TRACE",
  "PATCH",
}

export class Router {
  private routes: Record<string, Array<any>> = {};

  constructor() {
    for (const m in Methods) {
      this.routes[Methods[m]] = [];
    }
  }

  private add(method: string, pathname: string, handler: CallbackHandler) {
    this.routes[method].push({
      pattern: new URLPattern({ pathname }),
      handler,
    });
  }

  get(pathname: string, handler: CallbackHandler) {
    this.add("GET", pathname, handler);
  }

  head(pathname: string, handler: CallbackHandler) {
    this.add("HEAD", pathname, handler);
  }

  post(pathname: string, handler: CallbackHandler) {
    this.add("POST", pathname, handler);
  }

  put(pathname: string, handler: CallbackHandler) {
    this.add("PUT", pathname, handler);
  }

  delete(pathname: string, handler: CallbackHandler) {
    this.add("DELETE", pathname, handler);
  }

  options(pathname: string, handler: CallbackHandler) {
    this.add("OPTIONS", pathname, handler);
  }

  trace(pathname: string, handler: CallbackHandler) {
    this.add("TRACE", pathname, handler);
  }

  patch(pathname: string, handler: CallbackHandler) {
    this.add("PATCH", pathname, handler);
  }

  async route(request: Request): Promise<Response> {
    for (const route of this.routes[request.method]) {
      if (route.pattern.test(request.url)) {
        const params = route.pattern.exec(request.url).pathname.groups;
        try {
          return await route["handler"](request, params);
        } catch (_error) {
          return new Response(null, { status: 500 });
        }
      }
    }
    return new Response(null, { status: 404 });
  }
}
