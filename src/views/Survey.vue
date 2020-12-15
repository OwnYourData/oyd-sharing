<template>
  <b-container>
    <b-jumbotron>
      <transition
        name="fade"
        mode="out-in"
      >
        <b-spinner v-if="isWorking" />
        <b-form
          v-else
          class="form"
          @submit.prevent="next"
        >
          <oca-view
            :schemaDri="schemaDri"
            ref="ocaView"
          ></oca-view>
          <b-button
            type="submit"
            variant="primary"
          >
            Continue
          </b-button>
        </b-form>
      </transition>
    </b-jumbotron>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'

import OcaView from '../components/OCAView.vue';
import { SchemaService } from '../services/schema';
import { DATA_SERIES } from '../router';
import { ConfigService } from '../services/config';
import { MutationType } from '@/constants/mutation-type';
import { DataSeries, State } from '@/store';
import { Store } from 'vuex';

const addSurveyMeta = (store: Store<any>, propKey: string, value: any) => {
  const prop = ConfigService.get('dataObject', 'surveyMeta', propKey);
  if (prop) {
    store.commit(MutationType.SET_SURVEY_META_ITEM, {
      [prop]: value,
    });
  }
}

interface Data {
  isWorking: boolean;
}

export default Vue.extend({
  components: {
    OcaView,
  },
  data: (): Data => ({
    isWorking: true,
  }),
  async created() {
    if (!this.schemaDri)
      return;

    const overlays = await SchemaService.getOverlays(this.schemaDri);

    if (!overlays)
      return;

    const base = overlays.find(x => x.type.indexOf('schema_base') !== -1);
    if (!base)
      return;

    const attrs = base.attributes;
    for (const attr in attrs) {
      let value = attrs[attr];

      // TODO: just for testing
      if (value === 'DRI')
        // vital signs
        value = ['dri:ckkxqw93XFSTVH5aGgyxFC5GFojcwZAr6Ca17vnEg6zr']
      // TODO: just for testing

      // data series attributes always have to be an array
      if (!Array.isArray(value) || value.length === 0)
        continue;

      try {
        // first entry is schema dri
        const uri = new URL(value[0]);

        if (uri.protocol === 'dri:') {
          const payload: DataSeries = {
            schemaDri: uri.pathname,
            dataItems: [],
          };
          this.$store.commit(MutationType.SET_DATA_SERIES_ENTRY, payload);
        }
      } catch { /* There can be exceptions while parsing the URL */ }
    }

    this.isWorking = false;
  },
  computed: {
    schemaDri(): string | undefined {
      return (this.$store.state as State).schemaDri;
    },
    did(): string | undefined {
      return (this.$store.state as State).did;
    },
  },
  methods: {
    async next() {
      const {
        controllerUsagePolicy,
        isUsagePolicyMatching,
      } = this.$store.state as State;
      const survey = (this.$refs.ocaView as any).getDataObject();

      const store = this.$store;
      addSurveyMeta(store, 'did', this.did);
      addSurveyMeta(store, 'controllerUsagePolicy', controllerUsagePolicy);
      addSurveyMeta(store, 'isUsagePolicyMatching', isUsagePolicyMatching);

      this.$store.commit(MutationType.SET_SURVEY, survey);

      this.$router.push({
        name: DATA_SERIES,
      });
    }
  }
})
</script>

<style scoped>
.form >>> .controlItem {
  background-color: transparent;
}
</style>