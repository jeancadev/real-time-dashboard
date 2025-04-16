import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

function Loader({ color = "#007bff", size = 50 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
      <ClipLoader color={color} size={size} />
    </div>
  );
}

export default Loader;
