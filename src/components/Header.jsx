import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import NewChallenge from './NewChallenge.jsx';

export default function Header() {
  const [isCreatingNewChallenge, setIsCreatingNewChallenge] = useState();

  function handleStartAddNewChallenge() {
    setIsCreatingNewChallenge(true);
  }

  function handleDone() {
    console.log('hide');
    setIsCreatingNewChallenge(false);
  }

  return (
    <>
      <AnimatePresence>
        {console.log('aici', isCreatingNewChallenge)}
        {isCreatingNewChallenge && <NewChallenge onDone={handleDone} />}
      </AnimatePresence>

      <header id='main-header'>
        <h1>Your Challenges</h1>
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          transition={{ type: 'spring', stifness: 500 }}
          onClick={handleStartAddNewChallenge}
          className='button'
        >
          Add Challenge
        </motion.button>
      </header>
    </>
  );
}
