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
    const entries = overlays.find(x =>
      x['@context'] === 'https://odca.tech/overlays/v1' &&
      x.type.indexOf('entry') !== -1
    );

    if (base && entries) {
      const attrs = base.attributes;
      for (const attr in attrs) {
        let value = attrs[attr];

        if (value === 'DRI')
          value = entries.attr_entries[attr];

        // data series attributes always have to be an array
        if (!Array.isArray(value) || value.length === 0)
          continue;

        try {
          // first entry is schema BASE dri
          const uri = new URL(value[0]);
          // protocol is always lowercase when parsed by class "URI"
          if (uri.protocol === 'dri:') {
            // as the dri provided is only a schema base dri, we've to ask the repository which schema dris exist
            // because our data vault only knows about schema dris rather than schema base dris
            (await SchemaService.getOverlaySchemaDRIsFromSchemaBase(uri.pathname)).forEach((schemaDri) => {
              const payload: DataSeries = {
                schemaDri,
                dataItems: [],
              };
              this.$store.commit(MutationType.SET_DATA_SERIES_ENTRY, payload);
            });
          }
        } catch { /* There can be exceptions while parsing the URL */ }
      }
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