/* eslint-disable @typescript-eslint/camelcase */
import { DataSeries } from '@/store';
import { MimeType } from 'vaultifier';
import { ConfigService } from './config';
import { getInstance } from './vaultifier';

interface ShareObject {
  survey: Survey;
  series: TimeSeries[];
}

interface Survey {
  id: number;
  schema_dri: string;
  content: any;
}

interface TimeSeries {
  schema_dri: string;
  series: SeriesItem[];
}

interface SeriesItem {
  id: number;
  content: any;
}

interface ShareDataParams {
  survey: any;
  surveySchemaDri: string;
  dataSeries: DataSeries[];
}

export const shareData = async ({
  survey,
  surveySchemaDri,
  dataSeries,
}: ShareDataParams) => {
  const item = await getInstance().postItem({
    schemaDri: surveySchemaDri,
    mimeType: MimeType.JSON,
    content: survey,
  });

  const postObj: ShareObject = {
    survey: {
      id: item.id,
      schema_dri: surveySchemaDri,
      content: survey,
    },
    series: dataSeries.map<TimeSeries>(x => ({
      schema_dri: x.schemaDri,
      series: x.dataItems.map(y => ({
        id: y.id,
        content: y.content,
      })),
    })),
  };

  await getInstance().post(ConfigService.get('endpoints', 'share'), true, postObj);
}