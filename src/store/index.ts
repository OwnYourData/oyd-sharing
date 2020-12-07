import { ActionType } from '@/constants/action-type'
import { MutationType } from '@/constants/mutation-type'
import { VaultItem } from 'vaultifier';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export interface State {
  did?: string;
  dataUrl?: string;
  schemaDri?: string;
  survey?: any;
  surveyMeta?: any;
  controllerUsagePolicy?: string;
  isUsagePolicyMatching: boolean;
  dataSeries: DataSeries[];
}

export interface DataSeries {
  schemaDri: string;
  dataItems: VaultItem[];
}

const getDefaultState = (): State => ({
  did: undefined,
  dataUrl: undefined,
  schemaDri: undefined,
  survey: undefined,
  surveyMeta: undefined,
  controllerUsagePolicy: undefined,
  isUsagePolicyMatching: false,
  dataSeries: [],
});

export default new Vuex.Store<State>({
  state: getDefaultState(),
  mutations: {
    [MutationType.RESET_STATE]: (state) => {
      Object.assign(state, getDefaultState());
    },
    [MutationType.SET_DID]: (state, payload?: string) => {
      state.did = payload;
    },
    [MutationType.SET_SCHEMA_DRI]: (state, payload?: string) => {
      state.schemaDri = payload;
    },
    [MutationType.SET_SURVEY]: (state, payload?: any) => {
      state.survey = payload;
    },
    [MutationType.SET_SURVEY_META_ITEM]: (state, payload: any) => {
      state.surveyMeta = state.surveyMeta ?? {};
      state.surveyMeta = {
        ...state.surveyMeta,
        ...payload,
      };
    },
    [MutationType.SET_DATA_URL]: (state, payload?: string) => {
      state.dataUrl = payload;
    },
    [MutationType.SET_CONTROLLER_USAGE_POLICY]: (state, payload?: string) => {
      state.controllerUsagePolicy = payload;
    },
    [MutationType.SET_IS_USAGE_POLICY_MATCHING]: (state, payload: boolean) => {
      state.isUsagePolicyMatching = payload;
    },
    [MutationType.SET_DATA_SERIES_ENTRY]: (state, payload: DataSeries) => {
      const foundIndex = state.dataSeries.findIndex(x => x.schemaDri === payload.schemaDri);

      if (foundIndex !== -1)
        state.dataSeries.splice(foundIndex, 1, payload);
      else
        state.dataSeries.push(payload);
    }
  },
  actions: {
    [ActionType.RESET_STATE]: ({ commit }) => {
      commit(MutationType.RESET_STATE);
    }
  },
})
