<template>
  <b-container>
    <b-jumbotron lead="Welcome to OwnYourData Sharing!">
      <p>Please enter the DID that's been shared with you via Email</p>
      <b-form @submit.prevent="goToSharingInfo">
        <b-form-group>
          <b-form-input
            placeholder="Enter DID..."
            :state="isDidValid"
            v-model="did"
          ></b-form-input>
        </b-form-group>
        <b-button
          type="submit"
          variant="primary"
          :disabled="!isDidValid"
        >
          Submit
        </b-button>
      </b-form>
    </b-jumbotron>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { SHARING_INFO } from '../router';
import { parse } from 'did-resolver';
import { MutationType } from '@/constants/mutation-type';

interface Data {
  did?: string;
}

export default Vue.extend({
  data: (): Data => ({
    did: undefined,
  }),
  async created() {
    const { searchParams } = new URL(window.location.href);
    this.did = searchParams.get('did') || undefined;

    this.goToSharingInfo();
  },
  methods: {
    goToSharingInfo() {
      if (this.did && this.isDidValid === true) {
        this.$store.commit(MutationType.SET_DID, this.did);
        this.$router.push({
          name: SHARING_INFO,
        });
      }
    }
  },
  computed: {
    isDidValid(): boolean | undefined {
      if (!this.did)
        return undefined;

      try {
        parse(this.did);
        return true;
      } catch {/* */ }

      return false;
    }
  }
})
</script>