import React from 'react';
import ImageSplitView from '../components/home/ImageSplitView';

function HomePage() {
  return (
    <div className="App">
      <ImageSplitView skewed={true} />
    </div>
  );
}

export default HomePage;