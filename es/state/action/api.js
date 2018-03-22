import { doubleCreator } from '../helpers';
import '../../task/index.h';
import '../index.h';

var apiMeta = (_, id) => ({ _: 'api', id });

export var API = {
  REQUEST: {
    NEW: doubleCreator('api/request new', apiMeta),
    DONE: doubleCreator('api/request done')
  },
  TASK: {
    NEW: doubleCreator('api/task new'),
    DONE: doubleCreator('api/task done')
  },
  NEXT: doubleCreator('api/next')
};
//# sourceMappingURL=api.js.map