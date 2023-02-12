'use client';

import {useMachine} from '@xstate/react';
import {createMachine} from 'xstate';

const toggleMachine = createMachine({
    id: 'toggle',
    initial: 'inactive',
    states: {
        inactive: {
            on: {TOGGLE: 'active'}
        },
        active: {
            on: {TOGGLE: 'inactive'}
        }
    }
});

export default function Home() {
    const [state, send] = useMachine(toggleMachine);

    return (
        <main>
            <button onClick={() => send('TOGGLE')}>
                {state.value === 'inactive'
                    ? 'Click to activate'
                    : 'Active! Click to deactivate'}
            </button>
        </main>
    );
}
