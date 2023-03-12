'use client';

import { actions, createMachine, interpret } from 'xstate';
import { inspect } from '@xstate/inspect';
import { useEffect } from 'react';

const { log } = actions;

// 版块状态
// 1. 显示（默认）
// 2. 隐藏
// 3. 锁定
// 4. 关闭（逻辑删除）

const sectionMachine = createMachine(
  {
    predictableActionArguments: true,
    initial: 'show',
    context: {},
    states: {
      show: {
        on: {
          invisible: 'hide',
          secret: 'lock',
          delete: 'close',
          query: {
            actions: 'querySections',
          },
        },
      },
      hide: {
        on: {
          visible: 'show',
          secret: 'lock',
          delete: {
            target: 'close',
          },
        },
      },
      lock: {
        on: {
          visible: 'show',
          invisible: 'hide',
          delete: 'close',
        },
      },
      close: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      querySections: (context, event) => {
        console.log('querySections => ', []);
      },
    },
  }
);

export default function Home() {
  // const [state, send] = useMachine(toggleMachine);
  // useMachine(stateMachine);

  useEffect(() => {
    inspect({
      iframe: false,
    });

    const service = interpret(sectionMachine, { devTools: true });

    const subscription = service.subscribe((state) => {
      console.log('subscribe => ', state);
    });

    service.start();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <main>demo1</main>;
}
