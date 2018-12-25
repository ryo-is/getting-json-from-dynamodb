import { Component, Vue } from "vue-property-decorator";
import AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

@Component({})
export default class Home extends Vue {
  public accessKey: string = "";
  public fromTime: string = "";
  public partitionKey: string = "";
  public region: string = "";
  public secretAccessKey: string = "";
  public sortKey: string = "";
  public tableName: string = "";
  public targetPartitionKey: string = "";
  public toTime: string = "";

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

    const result = await DDB.query(params).promise();
    console.log(result.Items);

    const jsonData = result.Items;
    const blob = new Blob([JSON.stringify(jsonData, null, "　 ")], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample.json";
    link.click();
    URL.revokeObjectURL(url);
  }
}
