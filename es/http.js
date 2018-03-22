import axios, { AxiosError, AxiosXHR } from 'axios';
import { encaseP2 } from 'fluture';

export var httpClient = axios.create();
//$FlowIssue
delete httpClient.defaults.headers.post['Content-Type'];
//$FlowIssue
delete httpClient.defaults.headers.common['Accept'];

var requestOptions = { responseType: 'arraybuffer' };

var request = (url, data) => httpClient.post(url, data, requestOptions);

export var send = encaseP2(request);

// export function unwrapPromise<L, R>(
//   either: Apropos<L, Promise<R>>
// ): Promise<Apropos<L, R>> {
//   return either.fold(e => Promise.resolve(Left(e)), x => x.then(Right))
// }

export default httpClient;
//# sourceMappingURL=http.js.map