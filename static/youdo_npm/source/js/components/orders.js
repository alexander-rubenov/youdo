(() => {
  axios.defaults.baseURL = window.location.origin;

  Vue.component('order-item', {
    delimiters: ['[[', ']]'],
    template: '#order-item',
    data: () => {
      return {
        orderItems: [],
        isItemsFetching: true,
      }
    },
    mounted() {
      this.orderUUID = this.$attrs['order-uuid'];
      this.getOrder();
    },
    computed: {

    },
    methods: {
      getOrder() {
        axios
          .get(`api/order/${this.orderUUID}`)
          .then(({data: {items}}) => {
            this.orderItems.push(...items);
            this.isItemsFetching = false;
          });
      },
      getReportStatus: function (item) {
        switch (true) {
          case (item.is_has_report === false):
            return 'Не предусмотрен';
          case (Boolean(item.is_has_report) && item.report === undefined):
            return 'Не готов';
          case (Boolean(item.is_has_report) && Boolean(item.report)):
            return item.report;
          default:
            break;
        }
      },
    },
  });


  Vue.component('orders-table', {
    delimiters: ['[[', ']]'],
    template: '#orders-table',
    data: () => {
      return {
        orders: [],
        isItemsFetching: true,
      }
    },
    mounted() {
      this.orderUUID = this.$el.dataset.orderUuid;
      this.getOrders();
    },
    methods: {
      getOrders() {
        axios
          .get(`api/user/orders`)
          .then(({data}) => {
            this.orders.push(...data);
            this.isItemsFetching = false;
          });
      },
    },
  });

  const Orders = new Vue({
    delimiters: ['[[', ']]'],
    el: '#orders'
  });
})();

// is_has_report = false ---> Не предусмотрен
// is_has_report = true && report === undefined ---> Не готов
// is_has_report = true && report ---> report
