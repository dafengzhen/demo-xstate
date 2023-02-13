'use client';

import {assign, createMachine, interpret, raise} from 'xstate';
import {inspect} from '@xstate/inspect';
import {useEffect} from 'react';

// State Transitions
// Actions
// Context
// Guards
// Compound States
// Parallel States
// Final States
// History States
// Actor

const playerMachine = createMachine({
  initial: 'loading',
  context: {
    title: undefined,
    artist: undefined,
    duration: 0,
    elapsed: 0,
    likeStatus: 'unliked', // or 'liked' or 'disliked'
    volume: 5,
  },
  states: {
    loading: {
      tags: ['loading'],
      id: 'loading',
      on: {
        LOADED: {
          actions: 'assignSongData',
          target: 'ready',
        },
      },
    },
    ready: {
      initial: 'playing',
      states: {
        paused: {
          on: {
            PLAY: { target: 'playing' },
          },
        },
        playing: {
          entry: 'playAudio',
          exit: 'pauseAudio',
          on: {
            PAUSE: { target: 'paused' },
          },
          always: {
            cond: (ctx) => ctx.elapsed >= ctx.duration,
            target: '#loading',
          },
        },
      },
    },
  },
  on: {
    SKIP: {
      actions: 'skipSong',
      target: 'loading',
    },
    LIKE: {
      actions: 'likeSong',
    },
    UNLIKE: {
      actions: 'unlikeSong',
    },
    DISLIKE: {
      actions: ['dislikeSong', raise('SKIP')],
    },
    VOLUME: {
      cond: 'volumeWithinRange',
      actions: 'assignVolume',
    },
    'AUDIO.TIME': {
      actions: 'assignTime',
    },
  },
}).withConfig({
  actions: {
    assignSongData: assign({
      title: (_, e) => e.data.title,
      artist: (_, e) => e.data.artist,
      duration: (ctx, e) => e.data.duration,
      elapsed: 0,
      likeStatus: 'unliked',
    }),
    likeSong: assign({
      likeStatus: 'liked',
    }),
    unlikeSong: assign({
      likeStatus: 'unliked',
    }),
    dislikeSong: assign({
      likeStatus: 'disliked',
    }),
    assignVolume: assign({
      volume: (_, e) => e.level,
    }),
    assignTime: assign({
      elapsed: (_, e) => e.currentTime,
    }),
    skipSong: () => {
      console.log('Skipping song');
    },
    playAudio: () => {},
    pauseAudio: () => {},
  },
  guards: {
    volumeWithinRange: (_, e) => {
      return e.level <= 10 && e.level >= 0;
    },
  },
});

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

    service.subscribe((state) => {
      console.log('subscribe => ', state.value, state.actions, state.context);
    });

    service.start();

    service.send({
      type: 'LOADED',
      data: {
        title: 'Some song title',
        artist: 'Some song artist',
        duration: 100,
      },
    });
  }, []);

  return <main>test</main>;
}
