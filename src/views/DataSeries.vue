<template>
  <b-container>
    <transition
      name="fade"
      mode="out-in"
    >
      <b-jumbotron v-if="isWorking">
        <b-spinner />
      </b-jumbotron>
      <b-jumbotron
        v-else
        :lead="title"
      >
        <b-form
          @submit.prevent="next"
          @reset.prevent="back"
        >
          <p>Select all items you want to share:</p>
          <b-form-group>
            <b-badge variant="success">{{selectedDataItems.length}} selected</b-badge>
            <div
              v-if="!dataItems"
              class="list-container d-flex justify-content-center align-items-center"
            >
              <b-spinner />
            </div>
            <b-list-group
              v-else
              class="list-container"
            >
              <b-list-group-item
                v-for="item of dataItems"
                :key="item.id"
                :active="isSelected(item)"
                @click="() => toggleSelectedItem(item)"
              >
                <b-form-checkbox
                  @change="toggleSelectedItem(item)"
                  :checked="isSelected(item)"
                > {{getDateTimeString(item)}}</b-form-checkbox>
              </b-list-group-item>
            </b-list-group>
            <b-pagination
              :total-rows="totalDataItems"
              v-model="currentDataItemsPage"
              @page-click="(evt, page) => fetchDataItems(page)"
              align="fill"
            ></b-pagination>
          </b-form-group>

          <b-button type="reset">Back</b-button>
          &nbsp;
          <b-button
            variant="primary"
            type="submit"
          >Next</b-button>
        </b-form>
      </b-jumbotron>
    </transition>
  </b-container>
</template>

<script lang="ts">
import { MutationType } from '@/constants/mutation-type';
import { DATA_SERIES, REVIEW, SURVEY } from '@/router'
import { SchemaService } from '@/services/schema';
import { getInstance } from '@/services/vaultifier';
import { DataSeries, State } from '@/store'
import { getTitle } from '@/utils';
import { VaultItem } from 'vaultifier';
import Vue from 'vue'

interface Data {
  isWorking: boolean;
  page?: number;
  schemaDri: string;
  title?: string;
  selectedDataItems: VaultItem[];
  dataItems?: VaultItem[];
  currentDataItemsPage: number;
  totalDataItems: number;
}

export default Vue.extend({
  data: (): Data => ({
    isWorking: true,
    page: undefined,
    schemaDri: '',
    title: undefined,
    selectedDataItems: [],
    dataItems: undefined,
    currentDataItemsPage: 1,
    totalDataItems: 1,
  }),
  async created() {
    const { page } = this.$router.currentRoute.params;
    this.page = page ? parseInt(page) : 1;

    const dataSeries = this.dataSeries[(this.page - 1)];
    this.schemaDri = dataSeries.schemaDri;

    const [
      overlays,
    ] = await Promise.all([
      SchemaService.getOverlays(this.schemaDri),
      this.fetchDataItems()
    ]);

    if (overlays) {
      this.title = getTitle(overlays);
    }

    this.isWorking = false;
  },
  beforeRouteLeave(to, from, next) {
    // save all data before navigating away
    if (this.schemaDri) {
      const payload: DataSeries = {
        schemaDri: this.schemaDri,
        dataItems: this.selectedDataItems,
      };

      this.$store.commit(MutationType.SET_DATA_SERIES_ENTRY, payload);
    }

    next();
  },
  methods: {
    toggleSelectedItem(item: VaultItem) {
      const index = this.selectedDataItems.findIndex(x => x.id === item.id);

      if (index === -1)
        this.selectedDataItems.push(item);
      else
        this.selectedDataItems.splice(index, 1);
    },
    back() {
      if (this.page && this.hasBack)
        this.goto(this.page - 1);
      else
        this.$router.push({
          name: SURVEY,
        });
    },
    next() {
      if (this.page && this.hasNext)
        this.goto(this.page + 1);
      else
        this.$router.push({
          name: REVIEW,
        });
    },
    goto(page: number) {
      this.$router.push({
        name: DATA_SERIES,
        params: {
          page: page.toString(),
        }
      });
    },
    isSelected(item: VaultItem): boolean {
      return !!this.selectedDataItems.find(x => x.id === item.id);
    },
    getDateTimeString(item: VaultItem): string {
      return item.createdAt.toLocaleString();
    },
    async fetchDataItems(page?: number): Promise<void> {
      this.dataItems = undefined;

      const res = await getInstance().getItems({
        schemaDri: this.schemaDri,
        page: { page, },
      });

      this.currentDataItemsPage = res.paging.current;
      this.totalDataItems = res.paging.totalItems;

      this.dataItems = res.content;
    }
  },
  computed: {
    dataSeries(): DataSeries[] {
      return (this.$store.state as State).dataSeries;
    },
    totalPages(): number {
      return this.dataSeries.length;
    },
    hasBack(): boolean {
      return !!(this.page && this.page > 1);
    },
    hasNext(): boolean {
      return !!(this.page && this.page < this.totalPages);
    },
  }
})
</script>

<style scoped>
.list-container {
  height: 250px;
  overflow-y: auto;
}
</style>