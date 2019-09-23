(() => {
  const accordeonElement = document.querySelectorAll('.faq__question');

  function handleAction(evt) {
    if(evt.key === 'Enter' || evt.type === 'click') {
      const hiddenText = evt.currentTarget.querySelector('.faq__question-answer');
      const buttonIcon = evt.currentTarget.querySelector('.icon');

      if (hiddenText.style.maxHeight) {
        hiddenText.style.maxHeight = null;
        hiddenText.style.marginTop = null;
        buttonIcon.innerText = '+';
      }
      else {
        hiddenText.style.maxHeight = hiddenText.scrollHeight + 'px';
        hiddenText.style.marginTop = '20px';
        buttonIcon.innerText = '-';
      }
    }
  }

  const initializeAccordeon = () => {
    for (const item of accordeonElement) {
      item.addEventListener('click', handleAction);
      item.addEventListener('keydown', handleAction);
    }
  };

  initializeAccordeon();
})();
