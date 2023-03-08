'use client';

import { assign, createMachine, interpret } from 'xstate';
import { inspect } from '@xstate/inspect';
import { useEffect } from 'react';

// State Transitions
// Actions
// Context
// Guards
// Compound States
// Parallel States
// Final States
// History States
// Actor

// 审核通过 approved
// 审核不通过 not_approved
// 等待审核 awaiting_review
// 关闭审核 close_review
// 审核通过就绪 ready

// 总操作数 operations
// 通过的次数 passes
// 不通过的次数 failures
// 更新的次数 updates
// 拒绝的次数 rejections
// 成功的次数 successes
// 关闭的次数 closes

const playerMachine = createMachine(
  {
    predictableActionArguments: true,
    initial: 'approved',
    context: {
      operations: 0,
      passes: 0,
      failures: 0,
      updates: 0,
      rejections: 0,
      successes: 0,
      closes: 0,
    },
    states: {
      approved: {
        entry: [
          assign((context, event) => {
            return {
              operations: context.operations + 1,
              passes: context.passes + 1,
            };
          }),
        ],
        on: {
          no: {
            target: 'not_approved',
            actions: ['onFailure', 'onOperation'],
          },
          reject: {
            target: 'close_review',
            actions: ['onReject', 'onOperation'],
          },
          allow: {
            target: 'ready',
            actions: ['onSuccesses', 'onOperation'],
          },
        },
      },
      not_approved: {
        on: {
          yes: {
            target: 'approved',
            actions: ['onPasse', 'onOperation'],
          },
          update: {
            target: 'awaiting_review',
            actions: ['onUpdate', 'onOperation'],
          },
        },
      },
      awaiting_review: {
        on: {
          yes: {
            target: 'approved',
            actions: ['onPasse', 'onOperation'],
          },
          no: {
            target: 'not_approved',
            actions: ['onFailure', 'onOperation'],
          },
        },
      },
      close_review: {
        id: 'close_review',
        type: 'final',
      },
      ready: {
        type: 'parallel',
        initial: 'ready',
        states: {
          ready: {
            initial: 'show',
            states: {
              show: {
                on: {
                  close: 'close',
                  hide: 'hide',
                  lock: 'lock',
                },
              },
              hide: {
                on: {
                  close: 'close',
                  show: 'show',
                  lock: 'lock',
                },
              },
              lock: {
                on: {
                  close: 'close',
                  show: 'show',
                  hide: 'hide',
                },
              },
              close: {
                type: 'final',
                always: {
                  target: '#close_review',
                  actions: ['onClose', 'onOperation'],
                },
              },
            },
          },
          // whitelist: {},
          // blacklist: {},
          // close_comment: {},
          // close_reply: {},
          // close_comment_reply: {},
        },
        on: {
          whitelist: {
            actions: 'whitelist',
          },
          blacklist: {
            actions: 'blacklist',
          },
          close_comment: {
            actions: 'close_comment',
          },
          close_reply: {
            actions: 'close_reply',
          },
          close_comment_reply: {
            actions: 'close_comment_reply',
          },
        },
      },
    },
  },
  {
    actions: {
      onFailure: (context, event) => {
        context.failures += 1;
      },
      onOperation: (context, event) => {
        context.operations += 1;
      },
      onPasse: (context, event) => {
        context.passes += 1;
      },
      onUpdate: (context, event) => {
        context.updates += 1;
      },
      onReject: (context, event) => {
        context.rejections += 1;
      },
      onSuccesses: (context, event) => {
        context.successes += 1;
      },
      onClose: (context, event) => {
        context.closes += 1;
      },
    },
  }
);

export default function Home() {
  // const [state, send] = useMachine(toggleMachine);
  // useMachine(stateMachine);

  useEffect(() => {
    inspect({
      // options
      // url: 'https://stately.ai/viz?inspect', // (default)
      iframe: false, // open in new window
    });

    const service = interpret(playerMachine, { devTools: true });

    const subscription = service.subscribe((state) => {
      console.log('subscribe => ', state);
    });

    service.start();

    // service.send({
    //   type: 'LOADED',
    //   data: {
    //     title: 'Some song title',
    //     artist: 'Some song artist',
    //     duration: 100,
    //   },
    // });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return <main>test</main>;
}
