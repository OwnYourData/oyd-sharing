<template>
  <b-spinner v-if="isLoading" />
  <div v-else-if="hasForm">
    <div class="row">
      <div class="col-md-3">
        <b-form-select
          class="languages"
          v-model="selectedLanguage"
          :options="languageOptions"
          v-if="hasLanguages"
        ></b-form-select>
      </div>
    </div>
    <div class="row">
      <form-builder-gui :form="form"></form-builder-gui>
    </div>
  </div>
  <b-alert
    variant="warning"
    v-else
  >
    It seems the schema with DRI <code>{{item.schemaDri}}</code> is not a valid OCA schema.
  </b-alert>
</template>
<script lang="ts">
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'
import { SchemaService } from '../services/schema';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { FormBuilderGui } from 'oca.js-vue';
import { getLanguages, getObjectFromForm, renderForm } from '../utils';

interface Data {
  overlays?: any[];
  selectedLanguage?: string;
  isLoading: boolean;
}

export default Vue.extend({
  data: (): Data => ({
    overlays: undefined,
    selectedLanguage: undefined,
    isLoading: true,
  }),
  props: {
    item: Object as PropType<VaultItem | undefined>,
    schemaDri: String as PropType<string>,
  },
  components: {
    FormBuilderGui,
  },
  created() {
    this.getOverlays();
  },
  watch: {
    schemaDri() {
      this.getOverlays();
    },
    overlays() {
      this.selectedLanguage = this.hasLanguages && this.languages ? this.languages[0] : undefined;
    },
  },
  methods: {
    async getOverlays() {
      this.isLoading = true;
      this.overlays = await SchemaService.getOverlays(this.schemaDri);
      this.isLoading = false;
    },
    getDataObject(): any {
      return getObjectFromForm(this.form);
    }
  },
  computed: {
    form(): any {
      if (!this.overlays)
        return;

      return renderForm(this.overlays, this.item, this.selectedLanguage);
    },
    hasForm(): boolean {
      return !!this.form;
    },
    languages(): string[] | undefined {
      return this.overlays ? getLanguages(this.overlays) : undefined;
    },
    hasLanguages(): boolean {
      return !!(this.languages && this.languages.length > 0);
    },
    languageOptions(): any {
      return this.languages ? this.languages.map((x) => ({
        value: x,
        text: x,
      })) : undefined;
    },
  }
})
</script>

<style scoped>
.languages {
  margin-bottom: 2em;
}
</style>