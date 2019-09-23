(() => {
  const quickRegistrationForm = document.querySelector('#request-form');
  const submitButton = document.querySelector('.modal__submit');

  const handleQuickOrderRequest = (response) => {
    window.utils.enableSubmitButton(submitButton);

    const modalContent = document.querySelector('.modal__wrapper');

    modalContent.innerHTML = '<p class="request-form__success">Заявка успешно отправлена. В ближайшее время с вами свяжется наш менеджер</p>'
  };

  const handleQuickFormSubmit = (evt) => {
    evt.preventDefault();

    const data = new FormData();
    const nameField = quickRegistrationForm.querySelector('#form-name');
    const phoneField = quickRegistrationForm.querySelector('#form-phone');
    const emailField = quickRegistrationForm.querySelector('#form-email');
    const serviceField = quickRegistrationForm.querySelector('#form-service');
    const csrfToken = quickRegistrationForm.querySelector('#csrfToken');

    data.append('email', emailField.value);
    data.append('phone', phoneField.value);
    data.append('service', serviceField.value);
    data.append('name', nameField.value);
    data.append('csrfmiddlewaretoken', csrfToken.value);

    const fetchData = {
      url: window.urls.makeOrder,
      method: 'POST',
      body: data,
    };

    window.utils.makeRequest(fetchData, handleQuickOrderRequest);
    dataLayer.push({'event': 'popup','content':'send','content_2':serviceField.value});
    window.utils.disableSubmitButton(submitButton);
  };

  if(quickRegistrationForm) {
    quickRegistrationForm.addEventListener('submit', handleQuickFormSubmit);
  }
})();