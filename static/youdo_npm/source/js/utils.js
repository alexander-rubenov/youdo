(function () {
  function json(response) {
    if (response.status === 204) {
      return {};
    }

    return response.json();
  }

  function setStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  }

  window.urls = {
    makeOrder: '/order/',
  };

  window.utils = {
    csrfToken: document.getElementById('csrfToken').dataset.csrf,
    isUserAuthenticated: Boolean(document.getElementById('is_authenticated')),


    setStatus: function (response) {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else {
        return Promise.reject(response)
      }
    },

    getCookie: function (name) {
      const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));

      return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    setCookie: function (name, value, options) {
      options = options || {};

      let expires = options.expires;

      if (typeof expires == "number" && expires) {
        const d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      let updatedCookie = name + "=" + value;

      for (const propName in options) {
        updatedCookie += "; " + propName;
        const propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }

      document.cookie = updatedCookie + '; path=/;';
    },

    removeCookie: function (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    },

    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },

    getParentBlock: function (evt, limiterBlock, targetClassName) {
      let target = evt.target;

      while (target !== limiterBlock) {
        if (target.classList.contains(targetClassName)) {
          return target;
        }

        target = target.parentNode;
      }
    },

    collectFormData: function (form) {
      const fields = form.querySelectorAll('input');
      const formData = new FormData();

      fields.forEach(field => {
        formData.append(field.name, field.value)
      });

      formData.append('csrfmiddlewaretoken', this.csrfToken);

      return formData;
    },

    makeFetch: function (url, fetchData) {
      return fetch(url, fetchData)
        .then(setStatus)
        .then(json)
        .then(response => {
          return response;
        })
        .catch((error) => {
          throw new Error(error);
        });
    },

    makeRequest: function ({url, method, body = null}, handler) {
      const http = new XMLHttpRequest();
      const currentSubmitButton = document.querySelector('*[data-disabled="disabled"]');

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const parsedResponse = JSON.parse(http.responseText);
          handler(parsedResponse);
        }

        if(http.readyState === 4 && http.status === 500 || http.status === 405) {
          window.notifications.showNotification('error', 'Произошла ошибка сервера. Попробуйте позже.');
        }

        if(http.readyState === 4 && http.status === 403) {
          window.notifications.showNotification('error', 'Произошла ошибка доступа. Перезапустите сайт.');
        }

        this.enableSubmitButton(currentSubmitButton);
      };

      http.open(method, url, true);
      http.send(body);
    },

    setCustomVariableValue: (propertyName, newPropertyValue) => {
      document.documentElement.style.setProperty(propertyName, newPropertyValue);
    },

    downloadFile: (filePath) => {
      const element = document.createElement('a');

      element.style.display = 'none';
      element.setAttribute('href', filePath);
      element.setAttribute('download', 'pdf');
      element.setAttribute('target', '_blank');

      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },

    parseErrors: (errors) => {
      Object.keys(errors).forEach(error => {
        const invalidField = document.querySelector(`*[type='${error}']`);
        const fieldLabel = invalidField.parentElement;
        const errorBlock = invalidField.nextElementSibling;

        errorBlock.innerText = errors[error][0].message;
        fieldLabel.classList.add('user-account__label--error');
      });

    },

    isScrolledIntoView: function (target) {
      if (target.left === 0) return null;

      const targetPosition = {
        top: window.pageYOffset + target.getBoundingClientRect().top,
        left: window.pageXOffset + target.getBoundingClientRect().left,
        right: window.pageXOffset + target.getBoundingClientRect().right,
        bottom: window.pageYOffset + target.getBoundingClientRect().bottom
      };

      const windowPosition = {
        top: window.pageYOffset,
        left: window.pageXOffset,
        right: window.pageXOffset + document.documentElement.clientWidth,
        bottom: window.pageYOffset + document.documentElement.clientHeight
      };

      if (targetPosition.bottom > windowPosition.top &&
        (targetPosition.top + target.clientHeight * 0.5) < windowPosition.bottom) {
        return true;
      } else {
        return false;
      }
    },

    disableSubmitButton: (button) => {
      button.setAttribute('disabled', 'disabled');
      button.setAttribute('data-disabled', 'disabled');
      button.innerHTML += `<svg class="btn__loader" viewBox="25 25 50 50" aria-hidden="true"><circle <svg class="btn__loader-circle" cx="50" cy="50" r="20"></circle></svg>`;
    },

    enableSubmitButton: (button) => {
      if (button === null) return;

      if (button.hasAttribute('disabled')) {
        button.removeAttribute('disabled');
        button.removeAttribute('data-disabled');
        button.removeChild(document.querySelector('.btn__loader'));
      }
    }

  };
})();
