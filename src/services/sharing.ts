import { DataSeries } from '@/store';
import { MimeType } from 'vaultifier';
import { ConfigService } from './config';
import { getInstance } from './vaultifier';

interface TimeSeries {
  schema_dri: string;
  content: any[];
}

export const shareData = async (survey: {
  schemaDri: string;
  content: any;
  dataSeries: DataSeries[];
}) => {
  const item = await getInstance().postItem({
    schemaDri: survey.schemaDri,
    mimeType: MimeType.JSON,
    content: survey.content,
  });

  const postObj = {
    'survey_id': item.id,
    'time_series': survey.dataSeries.map<TimeSeries>(x => ({
      // eslint-disable-next-line @typescript-eslint/camelcase
      schema_dri: x.schemaDri,
      content: x.dataItems.map(x => x.content),
    })),
  };

  await getInstance().post(ConfigService.get('endpoints', 'share'), true, postObj);
}