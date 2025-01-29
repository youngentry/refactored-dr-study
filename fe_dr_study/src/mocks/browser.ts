import { setupWorker } from 'msw/browser';

import { mypageMockHandler } from './mypage/handler';

const worker = setupWorker(...mypageMockHandler);

export default worker;
