'use client';

import { actions, assign, createMachine, interpret, send } from 'xstate';
import { inspect } from '@xstate/inspect';
import { useEffect, useRef } from 'react';

const { log } = actions;

let count = 0;

async function openDialog(dialog: {
  data: { title: string; content: string };
}) {
  if (!dialog.data) {
    console.log('nodata');
    return;
  }

  console.log('openDialog', dialog.data.title, dialog.data.content);

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log('3000');
      resolve(true);
    }, 3000);
  });

  count = count + 1;
  console.log(count);
  return;
}

const machine = createMachine(
  {
    id: 'dialog',
    initial: 'hide',
    predictableActionArguments: true,
    context: {
      dialogQueue: [],
    },
    states: {
      hide: {
        on: {
          open: {
            cond: 'hasData',
            target: 'show',
            actions: 'enqueueDialog',
          },
        },
      },
      show: {
        invoke: {
          id: 'openDialog',
          src: 'performOpenDialog',
          onDone: {
            target: 'check',
            actions: ['dequeueDialog'],
          },
        },
        on: {
          cancel: { target: 'hide' },
          open: {
            actions: 'enqueueDialog',
          },
        },
      },
      check: {
        on: {
          open: {
            target: 'show',
          },
          close: {
            target: 'hide',
          },
        },
        entry: 'checkNextDialog',
      },
    },
  },
  {
    actions: {
      enqueueDialog: assign({
        dialogQueue: (context, event) => {
          return [...context.dialogQueue, event] as any;
        },
      }),
      dequeueDialog: assign({
        dialogQueue: (context, event) => {
          return context.dialogQueue.slice(1);
        },
      }),
      checkNextDialog: send((context, event) => {
        return (
          context.dialogQueue[0] ?? {
            type: 'close',
          }
        );
      }),
    },
    services: {
      performOpenDialog: async (context) => {
        const dialog = context.dialogQueue[0];
        await openDialog(dialog);
      },
    },
    guards: {
      hasData: (_, event) => {
        return !!event.data;
      },
    },
  },
);

export default function Home() {
  const serviceRef = useRef<any>(null);

  useEffect(() => {
    inspect({
      iframe: false,
    });

    const service = interpret(machine, { devTools: true });

    service.start();

    serviceRef.current = service;

    return () => {
      service?.stop();
    };
  }, []);

  function onClickFetchData() {
    serviceRef.current.send({
      type: 'open',
      data: { title: 'Dialog Title', content: 'Dialog Content' },
    });
  }

  return (
    <div className="container my-5 py-5">
      <div className="row">
        <div className="col"></div>
        <div className="col">
          <div className="card">
            <div className="card-body py-4">
              <div className="vstack gap-4">
                <button onClick={onClickFetchData} className="btn btn-primary">
                  获取数据
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col"></div>
      </div>
    </div>
  );
}
