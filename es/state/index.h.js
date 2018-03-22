import 'axios';

import ApiRequest from '../service/main/request';
import { NetMessage } from '../service/networker/net-message';
import NetworkerThread from '../service/networker';
import '../task/index.h';
import { KeyStorage } from '../util/key-storage';
import { KeyValue } from '../util/monad-t';
import { toCryptoKey, toDCNumber, toUID } from '../newtype.h'; /* {
                                                               message: NetMessage,
                                                               thread: NetworkerThread,
                                                               result: {
                                                               messageID: string,
                                                               response: MTP,
                                                               seqNo: number,
                                                               sessionID: Uint8Array,
                                                               },
                                                               normalized: MessageUnit[],
                                                               } */
//# sourceMappingURL=index.h.js.map