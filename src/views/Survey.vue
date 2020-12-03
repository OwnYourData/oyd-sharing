<template>
  <b-container>
    <b-jumbotron>
      <transition
        name="fade"
        mode="out-in"
      >
        <b-form
          class="form"
          v-if="!!ocaForm"
          @submit.prevent="next"
        >
          <form-builder-gui :form="ocaForm"></form-builder-gui>
          <b-button
            type="submit"
            variant="primary"
          >
            Continue
          </b-button>
        </b-form>
        <b-spinner v-else />
      </transition>
    </b-jumbotron>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'

import { FormBuilderGui } from 'oca.js-vue';
import { SchemaService } from '../services/schema';
import { getObjectFromForm, renderForm } from '../utils/oca';
import { DATA_SERIES } from '../router';
import { ConfigService } from '../services/config';
import { MutationType } from '@/constants/mutation-type';
import { DataSeries, State } from '@/store';

interface Data {
  ocaForm?: any;
}

const fillAdditionalProp = (obj: any, propKey: string, value: any) => {
  const prop = ConfigService.get('dataObject', 'additionalProps', propKey);
  if (prop)
    obj[prop] = value;
}

export default Vue.extend({
  data: (): Data => ({
    ocaForm: undefined,
  }),
  components: {
    FormBuilderGui,
  },
  async created() {
    if (!this.schemaDri)
      return;

    const overlays = await SchemaService.getOverlays(this.schemaDri);

    if (!overlays)
      return;

    this.ocaForm = renderForm(overlays);

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
      if (!this.ocaForm)
        return;

      const {
        controllerUsagePolicy,
        isUsagePolicyMatching,
      } = this.$store.state as State;
      const survey = getObjectFromForm(this.ocaForm);

      fillAdditionalProp(survey, 'did', this.did);
      fillAdditionalProp(survey, 'controllerUsagePolicy', controllerUsagePolicy);
      fillAdditionalProp(survey, 'isUsagePolicyMatching', isUsagePolicyMatching);

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