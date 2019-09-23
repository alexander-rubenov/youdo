(() => {
  const scrollingLinks = document.querySelectorAll('*[data-scroll-link]');

  const scrollToElement = (evt) => {
    evt.preventDefault();

    const target = evt.target;
    const scrollTo = document.getElementById(target.getAttribute('href'));

    if (scrollTo) {
      scrollTo.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  if(Boolean(scrollingLinks)) {
    scrollingLinks.forEach(link => link.addEventListener('click', scrollToElement));
  }
})();
