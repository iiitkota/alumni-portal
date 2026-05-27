// src/components/ScrollToTopButton.jsx


const ScrollToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <span className="text-xl">&#x2191;</span> {/* Up arrow symbol */}
    </button>
  );
};

export default ScrollToTopButton;
