import uuid from 'uuid/v4';

import { toUID } from '../newtype.h';

export default function newUuid() {
  return (/*:: toUID( */uuid().slice(0, 8)
  ); /*:: ) */
}
//# sourceMappingURL=uuid.js.map