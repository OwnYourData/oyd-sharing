<template>
  <div id="app">
    <b-container>
      <b-navbar
        type="dark"
        variant="dark"
      >
        <b-navbar-brand>OwnYourData Sharing</b-navbar-brand>
        <b-nav-text>{{version}}</b-nav-text>
      </b-navbar>
    </b-container>
    <transition
      name="fade"
      mode="out-in"
    >
      <keep-alive>
        <b-container v-if="isWorking">
          <b-jumbotron>
            <b-spinner />
          </b-jumbotron>
        </b-container>
        <!-- this key ensures components are not reused, if they specify the same component but have different paths -->
        <!-- this is important for our DataSeries component -->
        <router-view
          v-else
          :key="$router.history.current.path"
        />
      </keep-alive>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { HOME, THANK_YOU } from './router';
import * as VaultifierService from './services/vaultifier';
import { PACKAGE } from './services/config';
import { State } from './store';

interface Data {
  isWorking: boolean;
}

export default Vue.extend({
  data: (): Data => ({
    isWorking: true,
  }),
  async created() {
    // On app start, always go to our HOME page
    if (this.$router.currentRoute.name !== HOME)
      this.$router.replace({ name: HOME });

    this.$router.beforeEach((to, from, next) => {
      // Always go to HOME route, if there is no DID specified
      // Except for HOME and THANK_YOU page
      if (to.name && [
        THANK_YOU,
        HOME,
      ].indexOf(to.name) === -1 && !(this.$store.state as State).did)
        next({ name: HOME });
      else
        next();
    });

    await VaultifierService.initialize();
    this.isWorking = false;
  },
  computed: {
    version() {
      return PACKAGE.version;
    }
  }
});
</script>

<style>
.jumbotron {
  border-radius: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>