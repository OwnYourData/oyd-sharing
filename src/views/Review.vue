<template>
  <b-container>
    <b-jumbotron lead="Review">
      <p>Your data will be sent to <code>{{dataUrl}}</code></p>

      <p>The following data sets will be shared:</p>
      <ul>
        <li
          v-for="item of userFriendlyDataSeries"
          :key="item.title"
        >{{item.title}} <b-badge variant="success">{{getBadgeText(item)}}</b-badge>
        </li>
      </ul>

      <b-alert
        show
        v-if="errorText"
        variant="danger"
      >
        {{errorText}}
      </b-alert>
      <b-button
        variant="primary"
        @click="submit"
        :disabled="isWorking"
      >
        <b-spinner v-if="isWorking" /> Submit
      </b-button>
    </b-jumbotron>
  </b-container>
</template>

<script lang="ts">
import { ActionType } from '@/constants/action-type';
import { THANK_YOU } from '@/router';
import { SchemaService } from '@/services/schema';
import { shareData } from '@/services/sharing';
import { State } from '@/store';
import { getTitle } from '@/utils';
import Vue from 'vue'

interface UserFriendlyDataSeries {
  title: string;
  count: number;
}

interface Data {
  errorText?: string;
  isWorking: boolean;
  userFriendlyDataSeries: UserFriendlyDataSeries[];
}

export default Vue.extend({
  data: (): Data => ({
    errorText: undefined,
    isWorking: false,
    userFriendlyDataSeries: [],
  }),
  computed: {
    schemaDri() {
      return (this.$store.state as State).schemaDri;
    },
    survey() {
      return (this.$store.state as State).survey;
    },
    dataSeries() {
      return (this.$store.state as State).dataSeries;
    },
    dataUrl(): string | undefined {
      const url = (this.$store.state as State).dataUrl;

      if (url)
        return new URL(url).hostname;

      return undefined;
    }
  },
  created() {
    this.generateUserFriendlyDataSeries();
  },
  watch: {
    async dataSeries() {
      this.generateUserFriendlyDataSeries();
    }
  },
  methods: {
    getBadgeText(item: UserFriendlyDataSeries): string {
      const { count } = item;

      return `${count} item${count !== 1 ? 's' : ''}`
    },
    async generateUserFriendlyDataSeries() {
      const objs = await Promise.all(this.dataSeries.map(async (x) => ({
        dri: x.schemaDri,
        dataItems: x.dataItems,
        overlays: await SchemaService.getOverlays(x.schemaDri),
      })));

      this.userFriendlyDataSeries = objs.map(x => ({
        title: x.overlays ? getTitle(x.overlays) || x.dri : x.dri,
        count: x.dataItems.length,
      }));
    },
    async submit() {
      if (!(this.schemaDri && this.dataSeries))
        return;

      this.errorText = undefined;
      this.isWorking = true;

      try {
        await shareData({
          schemaDri: this.schemaDri,
          content: this.survey,
          dataSeries: this.dataSeries,
        });

        this.$store.dispatch(ActionType.RESET_STATE);
        this.$router.push({
          name: THANK_YOU,
        });
      }
      catch {
        this.errorText = 'We have experienced troubles while submitting the data.';
      }

      this.isWorking = false;
    }
  }
})
</script>