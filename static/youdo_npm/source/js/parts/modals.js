(() => {
  const modalTriggers = document.querySelectorAll('*[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('*[data-modal-close]');
  let openedModalID;

  const openModalWindow = (evt) => {
    const target = evt.currentTarget;
    const modalID = target.dataset.modalTarget;
    const modalService = target.dataset.modalService;
    const targetModal = document.getElementById(modalID);

    (openedModalID !== undefined) ? closeModalWindow(openedModalID) : null;

    openedModalID = modalID;

    targetModal.classList.add('visible');
    document.querySelector('body').classList.add('fixed');
    targetModal.querySelector('#form-service').value = modalService;

    dataLayer.push({'event': 'popup','content':'open','content_2':modalService});

    window.addEventListener('click', closeModalByBackground);
    window.addEventListener('keydown', closeModalByEsc);
  };

  const closeModalByEsc = (evt) => {
    if (evt.key === 'Escape') {
      closeModalWindow(openedModalID)
    }
  };

  const closeModalByBackground = (evt) => {
    if (evt.target.classList.contains('modal__bg')) {
      closeModalWindow(openedModalID)
    }
  };

  const closeModalByButton = (evt) => closeModalWindow(evt.currentTarget.dataset.modalClose);

  const closeModalWindow = (modalID) => {
    const targetModal = document.getElementById(modalID);

    targetModal.classList.remove('visible');
    document.querySelector('body').classList.remove('fixed');

    window.removeEventListener('click', closeModalByBackground);
    window.removeEventListener('keydown', closeModalByEsc);
  };

  const initializeModalTriggers = () => {
    for (const button of modalTriggers) {
      button.addEventListener('click', openModalWindow);
    }
  };

  closeModalButtons.forEach(button => button.addEventListener('click', closeModalByButton));

  window.modals = {
    openModalWindow: openModalWindow,
    closeModalWindow: closeModalWindow,
  };

  initializeModalTriggers();
})();
