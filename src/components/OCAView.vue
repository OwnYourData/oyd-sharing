<template>
  <transition
    name="fade"
    mode="out-in"
  >
    <div
      v-if="isLoading"
      key="spinner"
    >
      <b-spinner />
    </div>
    <div
      v-else-if="hasForm"
      key="form-container"
    >
      <b-alert
        variant="success"
        show
      >
        We've already been able to pre-fill some of they survey's data from your data vault!
      </b-alert>
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
      v-else-if="!!item"
    >
      It seems the schema with DRI <code>{{item.schemaDri}}</code> is not a valid OCA schema.
    </b-alert>
    <b-alert
      variant="warning"
      v-else
    >
      Something went terribly wrong here.
    </b-alert>
  </transition>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { SchemaService } from '../services/schema';
import { FormBuilderGui } from 'oca.js-vue';
import { fillForm, getLanguages, getObjectFromForm, getSchemaDris, renderForm } from '../utils';
import { getInstance } from '@/services/vaultifier';

interface Data {
  form?: any;
  overlays?: any[];
  selectedLanguage?: string;
  isLoading: boolean;
  hasPreFilled: boolean;
}

export default Vue.extend({
  data: (): Data => ({
    form: undefined,
    overlays: undefined,
    selectedLanguage: undefined,
    isLoading: true,
    hasPreFilled: true,
  }),
  props: {
    schemaDri: String as PropType<string>,
  },
  components: {
    FormBuilderGui,
  },
  created() {
    this.setupOcaForm();
  },
  watch: {
    schemaDri() {
      this.setupOcaForm();
    },
    overlays() {
      this.selectedLanguage = this.hasLanguages && this.languages ? this.languages[0] : undefined;
    },
  },
  methods: {
    async setupOcaForm() {
      this.isLoading = true;

      this.overlays = await SchemaService.getOverlays(this.schemaDri);
      if (this.overlays) {
        this.form = await renderForm(this.overlays, this.schemaDri, this.selectedLanguage);

        const schemaDris = getSchemaDris(this.form);
        const schemaObj = {} as { [key: string]: any };

        await Promise.all(schemaDris.map(async (s) => {
          const res = await getInstance().getItems({
            schemaDri: s,
          });

          // just take the first item, if available
          if (res.content.length > 0)
            schemaObj[s] = res.content[0].content;
        }));

        this.hasPreFilled = fillForm(this.form, schemaObj);
      }

      this.isLoading = false;

      this.$emit('ready');
    },
    getDataObject(): any {
      return getObjectFromForm(this.form);
    },
  },
  computed: {
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