// TODO:
//  1) video-player-container make as a separate component;
//  2) services-list and slider methods mounted are similar. Move it to serviceRoot component;
//  3) deactivateFullPlayer method was duplicated, move it to serviceRoot component;

(() => {
  axios.defaults.baseURL = window.location.origin;

  Vue.component('video-block', {
    delimiters: ['[[', ']]'],
    template: '#video-block',
    props: {
      service: Object,
      getServiceUrl: String,
      sendEcommerceData: Function,
      poster: String,
      videoLink: String,
    },
    data: () => {
      return {
        timeoutID: null,
      }
    },
    methods: {
      activateVideoPlayer() {
        const video = this.$refs.videoRef;

        const timeoutID = setTimeout(() => {
          const playPromise = video.play();
        }, 1000);

        this.timeoutID = timeoutID;

      },

      deactivateVideoPlayer() {
        const video = this.$refs.videoRef;

        clearTimeout(this.timeoutID);
        video.pause();
        video.currentTime = 0;
        this.timeoutID = null;
      },

      activateFullPlayer() {
        const playerContainer = document.getElementById('video-player-container');
        const player = document.getElementById('full-video-player');

        this.deactivateVideoPlayer();

        playerContainer.classList.add('full-player-container--visible');
        document.querySelector('body').classList.add('fixed');

        player.src = this.$refs.videoRef.src;
        player.controls = true;

        const playPromise = player.play();
      },
    }
  });

  Vue.component('add-cart-button', {
    delimiters: ['[[', ']]'],
    template: '#add-cart-button',
    props: {
      label: Number,
      service: Object | String,
    },
    methods: {
    }
  });

  Vue.component('file-download-button', {
    delimiters: ['[[', ']]'],
    template: '#file-download-button',
    props: {
      label: String,
    },
    methods: {
      downloadFile(evt) {
        if (window.utils.isUserAuthenticated === false) {
          evt.preventDefault();
          window.modals.openModalWindow(evt);
          window.modals.downloadFile = this.$attrs.href[0][0];
        }
      },
    }
  });

  Vue.component('services-list-item', {
    delimiters: ['[[', ']]'],
    template: '#services-list-item',
    props: {
      service: Object,
      isServicesFetching: Boolean,
      pageName: String,
    },
    computed: {
      getCoverImg: function () {
        return `background-image: linear-gradient(180deg, rgba(83, 27, 136, 0) 0%, rgba(83, 27, 136, 0.5) 100%), url('${this.service.cover}')`
      },
      getServiceUrl: function () {
        return `/${(this.service.object_type === 'Package') ? 'package' : 'service'}/${this.service.id}`;
      },
    },
    methods: {
      sendEcommerceData() {
        const {name, id, price, tags, object_type} = this.service;

        dataLayer.push({
          'event': 'productClick',
          'ecommerce': {
            'click': {
              'actionField': {
                'list': `${this.pageName}`,
              },
              'products': [{
                'name': `${name}`,
                'id': `${object_type.toLowerCase()}-${id}`,
                'price': `${price}.00`,
                'category': tags.map(tag => (tag.name)).join('|'),
                'position': this.$attrs.index,
              }]
            }
          },
        });

      },
    },
  });

  Vue.component('slider', {
    delimiters: ['[[', ']]'],
    template: '#slider',
    props: {
      pageName: String,
    },
    data: () => {
      return {
        servicesCollection: [],
      }
    },
    mounted() {
      const fullVideoPlayer = document.getElementById('full-video-player');

      if (Boolean(fullVideoPlayer)) {
        fullVideoPlayer.addEventListener('ended', this.deactivateFullPlayer);
      }
    },
    created() {
      this.getServices();
    },
    computed: {
      getSliderId: function () {
        return this.$attrs['slider-id'];
      },
    },
    methods: {
      getServices() {
        const fetchData = new FormData();
        fetchData.append('csrfmiddlewaretoken', document.getElementById('csrfToken').value);

        axios
          .get(this.$attrs.url, fetchData)
          .then(({data}) => {
            if (data.packages !== undefined && data.services !== undefined) {
              this.servicesCollection.push(...data.packages, ...data.services);
            } else {
              this.servicesCollection.push(...data);
            }

            this.isServicesFetching = false;
          });
      },
      deactivateFullPlayer(evt) {
        const playerContainer = document.getElementById('video-player-container');
        const player = document.getElementById('full-video-player');

        if (evt.target.classList.contains('full-player') && evt.type !== 'ended') return;

        playerContainer.classList.remove('full-player-container--visible');
        document.querySelector('body').classList.remove('fixed');
        player.src = '';
      },
    },
  });

  Vue.component('services-list', {
    delimiters: ['[[', ']]'],
    template: '#services-list',
    props: {
      isWideLayout: Boolean,
      showAllServicesLink: Boolean,
      pageName: String,
    },
    data: () => {
      return {
        servicesCollection: [],
        isServicesFetching: true,
      }
    },
    mounted() {
      const fullVideoPlayer = document.getElementById('full-video-player');

      if (Boolean(fullVideoPlayer)) {
        fullVideoPlayer.addEventListener('ended', this.deactivateFullPlayer);
      }
    },

    created() {
      this.getServices();
    },
    methods: {
      getServices() {
        const fetchData = new FormData();
        fetchData.append('csrfmiddlewaretoken', document.getElementById('csrfToken').value);

        axios
          .get(this.$attrs.url, fetchData)
          .then(({data}) => {

            if (data.packages !== undefined && data.services !== undefined) {
              this.servicesCollection.push(...data.packages, ...data.services);
            } else {
              this.servicesCollection.push(...data);
            }

            this.isServicesFetching = false;
          });
      },

      deactivateFullPlayer(evt) {
        const playerContainer = document.getElementById('video-player-container');
        const player = document.getElementById('full-video-player');

        if (evt.target.classList.contains('full-player') && evt.type !== 'ended') return;

        playerContainer.classList.remove('full-player-container--visible');
        document.querySelector('body').classList.remove('fixed');
        player.src = '';
      }
    },
  });

  const serviceRoot = new Vue({
    delimiters: ['[[', ']]'],
    el: '#service-root',
  });

})();
