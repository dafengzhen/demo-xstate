'use client';

import { createActor, createMachine } from 'xstate';
import { useEffect } from 'react';

export default function Home() {
  const toggleMachine = createMachine({
    id: 'toggle',
    initial: 'Inactive',
    states: {
      Inactive: {
        on: { toggle: 'Active' },
      },
      Active: {
        on: { toggle: 'Inactive' },
      },
    },
  });

  const actor = createActor(toggleMachine);

  useEffect(() => {
    // Subscribe to snapshots (emitted state changes) from the actor
    actor.subscribe((snapshot) => {
      console.log('Value:', snapshot.value);
    });

    // Start the actor
    actor.start(); // logs 'Inactive'

    // Send events
    actor.send({ type: 'toggle' }); // logs 'Active'
    actor.send({ type: 'toggle' }); // logs 'Inactive'
  }, [actor]);

  return <div>demo-xstate</div>;
}
