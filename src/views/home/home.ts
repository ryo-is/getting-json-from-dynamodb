import { Component, Vue } from "vue-property-decorator";
import AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import json2csv from "json2csv";
import { strict } from 'assert';

@Component({})
export default class Home extends Vue {
  public accessKey: string = "AKIAIIGXN5PADEBRFBCQ";
  public fromTime: string = "2018-12-26T03:08:31+09:00";
  public partitionKey: string = "ID";
  public region: string = "ap-northeast-1";
  public secretAccessKey: string = "aMdlOodpajqjWuhWygKydTqKxG+6FHMNbKVYoySU";
  public sortKey: string = "record_time";
  public tableName: string = "iot_dummy_data";
  public targetPartitionKey: string = "b001";
  public toTime: string = "2018-12-26T09:08:31+09:00";

  public async getDynamoDBData() {
    const self = this;
    const DDB = new AWS.DynamoDB.DocumentClient({
      accessKeyId: self.accessKey,
      secretAccessKey: self.secretAccessKey,
      region: self.region,
    });

    const params: DocumentClient.QueryInput = {
      TableName: self.tableName,
      KeyConditionExpression: "#hkey = :hkey and #rkey between :fromTime and :toTime",
      ExpressionAttributeNames: {
        "#hkey": self.partitionKey,
        "#rkey": self.sortKey,
      },
      ExpressionAttributeValues: {
        ":hkey": self.targetPartitionKey,
        ":fromTime": self.fromTime,
        ":toTime": self.toTime,
      },
    };

    const result: DocumentClient.QueryOutput = await DDB.query(params).promise();
    console.log(result.Items);
    return result.Items;
  }

  public async getJson() {
    const data = await this.getDynamoDBData();
    const blobData = JSON.stringify(data, null, "　 ");

    this.fileDownload([blobData], "application/json", "sample.json");
  }

  public async getCsv() {
    const data: any = await this.getDynamoDBData();

    const fieldKeys: string[] = [];
    Object.keys(data[0]).map((key: string) => {
      fieldKeys.push(key);
    });
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const csvData = json2csv.parse(data, {fields: fieldKeys});
    console.log(csvData);
    this.fileDownload([bom, csvData], "text/csv", "sample.csv");
  }

  public fileDownload(data: any[], mineType: string, fileName: string) {
    const blob = new Blob(data, {type: mineType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
