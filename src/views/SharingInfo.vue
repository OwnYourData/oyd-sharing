<template>
  <b-container>
    <b-jumbotron>
      <transition
        name="fade"
        mode="out-in"
      >
        <b-spinner v-if="isWorking" />
        <b-alert
          show
          variant="warning"
          v-else-if="isError"
        >
          Sorry, but it seems we can not load all necessary data for this data sharing.
        </b-alert>
        <div v-else>
          <p>{{description}}</p>

          <b-alert
            show
            v-if="isUsagePolicyMatching"
            variant="success"
          >
            <b-icon icon="shield-check" />
            Your usage policy is compatible with this data sharing.
          </b-alert>
          <b-alert
            show
            v-else
            variant="danger"
          >
            <b-icon icon="shield-exclamation" />
            Your usage policy is <strong>not</strong> compatible with this data sharing.<br>
            However, you can still proceed and consent with the data sharing's usage policy.
          </b-alert>
          <b-form
            v-if="isValid"
            @submit.prevent="goToShare"
          >
            <b-form-group>
              <b-form-checkbox
                v-if="!isUsagePolicyMatching"
                v-model="isConsenting"
              >I want to proceed with data sharing, even if my and the data controller's usage policy don't match.</b-form-checkbox>
            </b-form-group>
            <b-button
              variant="primary"
              type="submit"
              :disabled="!isValid || (!isUsagePolicyMatching && !isConsenting)"
            >
              Continue
            </b-button>
          </b-form>
        </div>
      </transition>
    </b-jumbotron>
  </b-container>
</template>

<script lang="ts">
import { SURVEY } from '@/router';
import { ConfigService } from '../services/config';
import Vue from 'vue'

import { getServiceEndpoint, resolve } from '../utils/did';
import { State } from '@/store';
import { MutationType } from '@/constants/mutation-type';
import { getInstance } from '@/services/vaultifier';

interface Data {
  isWorking: boolean;
  sharingInfo?: any;
  isUsagePolicyMatching?: boolean;
  isConsenting: boolean;
}

export default Vue.extend({
  data: (): Data => ({
    isWorking: false,
    sharingInfo: undefined,
    isUsagePolicyMatching: undefined,
    isConsenting: false,
  }),
  async created() {
    if (!this.did)
      return;

    this.isWorking = true;

    try {
      const [
        doc,
        subjectUsagePolicy,
      ] = await Promise.all([
        resolve(this.did),
        getInstance().getUsagePolicy(),
      ]);

      const infoUrl = getServiceEndpoint(doc, ConfigService.get('serviceTypes', 'info', 'key'));
      const dataUrl = getServiceEndpoint(doc, ConfigService.get('serviceTypes', 'data', 'key'));
      const controllerUsagePolicyUrl = getServiceEndpoint(doc, ConfigService.get('serviceTypes', 'usagePolicy', 'key'));

      if (infoUrl && dataUrl && controllerUsagePolicyUrl) {
        this.$store.commit(MutationType.SET_DATA_URL, dataUrl);

        const [
          json,
          controllerUsagePolicy,
        ] = await Promise.all([
          fetch(infoUrl).then(res => res.json()),
          fetch(controllerUsagePolicyUrl).then(res => res.text()),
        ]);

        this.sharingInfo = Array.isArray(json) ? json[0] : json;

        const usagePolicyMatch = await fetch(ConfigService.get('endpoints', 'usagePolicyMatch'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'data-subject': subjectUsagePolicy,
            'data-controller': controllerUsagePolicy,
          })
        }).then(res => res.json());

        this.isUsagePolicyMatching = usagePolicyMatch.code === 0

        this.$store.commit(MutationType.SET_CONTROLLER_USAGE_POLICY, controllerUsagePolicy);
        this.$store.commit(MutationType.SET_IS_USAGE_POLICY_MATCHING, this.isUsagePolicyMatching);
      }
    }
    catch { /* */ }

    this.isWorking = false;
  },
  methods: {
    goToShare() {
      if (!(this.schemaDri && this.did))
        return;

      // TODO:
      const schemaDri = '8unrKdijiW6gEq3FEXC6unK4xuqmpxMmikPLRteSi5uS';

      this.$store.commit(MutationType.SET_SCHEMA_DRI, schemaDri);
      this.$router.push({
        name: SURVEY,
      })
    }
  },
  computed: {
    schemaDri(): string | undefined {
      return this.sharingInfo ?
        this.sharingInfo[ConfigService.get('serviceTypes', 'info', 'properties', 'schemaDri')] :
        undefined;
    },
    description(): string | undefined {
      return this.sharingInfo ?
        this.sharingInfo[ConfigService.get('serviceTypes', 'info', 'properties', 'description')] :
        undefined;
    },
    isValid(): boolean {
      return !!(this.schemaDri && this.did);
    },
    isError(): boolean {
      return !(this.sharingInfo && this.isUsagePolicyMatching !== undefined)
    },
    did(): string | undefined {
      return (this.$store.state as State).did;
    },
  },
})
</script>