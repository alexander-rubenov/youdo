(() => {
  axios.defaults.baseURL = window.location.origin;

  const cartConfig = {
    serviceMinValue: 1,
    serviceMaxValue: 10,
  };

  Vue.component('free-service-item', {
    delimiters: ['[[', ']]'],
    template: '#free-service-item',
    props: {
      freeCartItem: Object,
    },
  });

  Vue.component('service-item', {
    delimiters: ['[[', ']]'],
    template: '#service-item',
    props: {
      cartItem: Object,
      removeFromCart: Function,
      renderOrderUpdateResult: Function,
      markFreeItem: Function
    },
    data: () => {
      return {
        cartItemInfo: Object,
      }
    },
    created() {
    },

    computed: {
      getItemLink: function () {
        const {item: {object_type, id}} = this.cartItem;

        return `${object_type.toLowerCase()}/${id}`
      },
    },

    methods: {
      updateCartItem(changedItemId) {
        const data = new FormData();
        const {uuid, count} = this.cartItem;
        const orderUUID = this.$attrs['order-uuid'];

        data.append('uuid', uuid);
        data.append('csrfmiddlewaretoken', window.utils.csrfToken);

        if (this.cartItem.item.hasOwnProperty('services')) {
          const {services} = this.cartItem.item;
          const updatedService = services.filter(({id}) => (id === changedItemId))[0];

          data.append('service_id', updatedService.id);
          data.append('service_count', updatedService.in_order_count);
        } else {
          data.append('count', count);
        }


        axios
          .post(`api/order/${orderUUID}/item/update`, data)
          .then(({data}) => {
            this.renderOrderUpdateResult(data);
            // this.markFreeItem(data);
          });
      },

      changePackageServiceAmount(changedServiceId, action) {
        const {item: {services, price}, count} = this.cartItem;
        const targetService = services.filter(({id: serviceId}) => serviceId === changedServiceId)[0];

        if (cartConfig.serviceMaxValue >= targetService.in_order_count >= cartConfig.serviceMinValue) {
          switch (action) {
            case 'plus':
              if (targetService.in_order_count < cartConfig.serviceMaxValue) {
                targetService.in_order_count += 1;
              }
              break;
            case 'minus':
              if (targetService.in_order_count > targetService.default_count) {
                targetService.in_order_count -= 1;
              }
              break;
            default:
              break;
          }

          targetService.additional_price = (targetService.in_order_count - targetService.default_count) * targetService.price;
          this.cartItem.total_price = price * count + targetService.additional_price;
          this.updateCartItem(changedServiceId);
        }
      },

      changeServiceAmount(id, action) {
        const {count} = this.cartItem;

        if (cartConfig.serviceMaxValue >= count >= cartConfig.serviceMinValue) {
          switch (action) {
            case 'plus':
              if (count < cartConfig.serviceMaxValue) {
                this.cartItem.count += 1;
              }
              break;
            case 'minus':
              if (count > cartConfig.serviceMinValue) {
                this.cartItem.count -= 1;
              }
              break;
            default:
              break;
          }

          this.cartItem.total_price = this.cartItem.item.price * this.cartItem.count;

          this.updateCartItem();
        }
      },
    }
  });

  const cart = new Vue({
    delimiters: ['[[', ']]'],
    el: '#cart',
    data: () => {
      return {
        cartItems: [],
        freeCartItems: [],
        orderUUID: String,
        areItemsFetching: true,
        totalCartSum: 0,
        promocode: {
          discount: null,
          error: {
            text: '',
            status: false,
          },
        },
      }
    },

    computed: {
      isPromocodeActivated() {
        const {discount, error: {status}} = this.promocode;

        return discount > 0 && status === false;
      }
    },

    mounted() {
      this.orderUUID = this.$el.dataset.orderUuid;
      this.getInitialCartState();
    },

    methods: {
      getInitialCartState() {
        if (this.orderUUID !== undefined) {
          axios
            .get(`api/order/${this.orderUUID}`)
            .then(({data}) => {
              this.cartItems.push(...data.items);
              this.totalCartSum = data.total_price;
              this.promocode.discount = data.promocode_discount;
              this.areItemsFetching = false;

              // const freeItemID = this.getFreeItemId(data);
              // this.markFreeItem(freeItemID);
            });
        }
      },

      renderOrderUpdateResult({order_total_price, order_items_count}) {
        const headerButtonCart = document.querySelector('.header__button--cart');
        const buttonText = headerButtonCart.querySelector('.header__cart-text');
        const buttonCounter = headerButtonCart.querySelector('.header__orders-count');
        const totalOrderPrice = document.querySelector('.quick-order__total-price');

        this.totalCartSum = order_total_price;

        totalOrderPrice.innerText = `${order_total_price}₽`;
        buttonText.innerText = `${order_total_price}₽`;
        (Boolean(order_items_count)) ? buttonCounter.innerText = order_items_count : null;
      },

      getFreeItemId(collection) {
        let id;

        collection.map((item) => {
          if (item.hasOwnProperty('is_free') && item.is_free !== undefined) {
            return id = item.item_uuid;
          }
        });

        return {
          free_item_uuid: id
        }
      },

      markFreeItem({free_item_uuid}, cartItems = this.cartItems) {
        this.freeCartItems = [];

        cartItems.map((cartItem) => {
          if (cartItem.item_uuid === free_item_uuid) {
            if (cartItem.item_count > 1) {
              const markedItem = {
                ...cartItem,
                is_free: true,
                item_count: 1,
                item_total_price: `Бесплатно`,
              };

              Vue.set(cartItem, 'is_free', false);
              Vue.set(cartItem, 'isDecreasedByPromo', true);

              if (!cartItem.isDecreased) {
                cartItem.item_count -= 1;
                cartItem.isDecreased = true;
              }

              cartItem.item_total_price = cartItem.item_price * cartItem.item_count;

              this.freeCartItems.push(markedItem);
            } else {
              Vue.set(cartItem, 'is_free', true);
              Vue.set(cartItem, 'isDecreasedByPromo', false);
              Vue.set(cartItem, 'item_total_price', `Бесплатно`);
              Vue.set(cartItem, 'item_total_price', `Бесплатно`);
            }

          } else {
            Vue.set(cartItem, 'is_free', false);
            Vue.set(cartItem, 'isDecreasedByPromo', false);
          }
        });
      },

      removeFromCart(targetItemId) {
        const requestData = new FormData();
        let deletedItemUUID, removeIndex;

        this.cartItems.map(({item: {id}}, index) => {
          if (id === targetItemId) {
            return removeIndex = index;
          }
        });

        deletedItemUUID = this.cartItems[removeIndex].uuid;

        requestData.append('uuid', deletedItemUUID);
        requestData.append('csrfmiddlewaretoken', window.utils.csrfToken);

        axios
          .post(`api/order/${this.orderUUID}/item/remove`, requestData)
          .then(({data: {order_total_price, order_items_count, order_removed, item_info: {name, id, price, category, quantity}}}) => {

            Vue.delete(this.cartItems, removeIndex);

            if (Boolean(order_removed)) {
              return window.location.reload();
            } else {
              this.renderOrderUpdateResult({order_items_count, order_total_price});
            }

            dataLayer.push({
              'event': 'removeFromCart',
              'ecommerce': {
                'remove': {
                  'products': [{
                    'name': name,
                    'id': id,
                    'price': price,
                    'category': category,
                    'quantity': quantity
                  }]
                }
              }
            });

            // if (free_item_uuid !== undefined) {
            //   this.markFreeItem({free_item_uuid});
            // }
          });

      },

      openPromocodeModal(evt) {
        window.modals.openModalWindow(evt);
      },

      closePromocodeModal(evt) {
        window.modals.closeModalWindow(evt.currentTarget.dataset.modalClose);
      },

      sendPromocode(evt) {
        axios
          .post(`api/order/${this.orderUUID}/promocode`, window.utils.collectFormData(evt.target))
          .then(({data: {order_total_price, promocode_discount}}) => {
            const closePopupTime = 1500;

            this.promocode.discount = promocode_discount;
            this.promocode.error.text = null;
            this.promocode.error.status = false;

            this.renderOrderUpdateResult({order_total_price});

            setTimeout(() => {
              window.modals.closeModalWindow('promocode-modal');
            }, closePopupTime);
          })
          .catch(({response: {data: {detail}}}) => {
            this.promocode.error.text = detail;
            this.promocode.error.status = true;
          });
      },

      removePromocode() {
        const fetchData = new FormData();

        fetchData.append('csrfmiddlewaretoken', window.utils.csrfToken);

        axios
          .post(`/api/order/${this.orderUUID}/promocode/remove`, fetchData)
          .then(({data: {order_total_price}}) => {

            this.renderOrderUpdateResult({order_total_price});

            this.promocode.error.text = null;
            this.promocode.error.status = false;
            this.promocode.discount = 0;
          });
      }
    },
  });
})();