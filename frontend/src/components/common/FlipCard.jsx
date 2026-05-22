import React, { useState } from 'react';

export const FlipCard = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer w-full max-w-sm perspective"
    >
      <div className={`relative duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute backface-hidden p-4 border rounded-lg bg-white">
          {front}
        </div>
        <div className="absolute backface-hidden rotate-y-180 p-4 border rounded-lg bg-gray-50">
          {back}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
