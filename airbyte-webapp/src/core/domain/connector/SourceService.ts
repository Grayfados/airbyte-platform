import { AirbyteRequestService } from "core/request/AirbyteRequestService";
import { CommonRequestError } from "core/request/CommonRequestError";
import { LogsRequestError } from "core/request/LogsRequestError";

import {
  createSource,
  deleteSource,
  discoverSchemaForSource,
  getSource,
  listSourcesForWorkspace,
  SourceCreate,
  SourceUpdate,
  updateSource,
} from "../../request/AirbyteClient";

export class SourceService extends AirbyteRequestService {
  public get(sourceId: string) {
    return getSource({ sourceId }, this.requestOptions);
  }

  public list(workspaceId: string) {
    return listSourcesForWorkspace({ workspaceId }, this.requestOptions);
  }

  public create(body: SourceCreate) {
    return createSource(body, this.requestOptions);
  }

  public update(body: SourceUpdate) {
    return updateSource(body, this.requestOptions);
  }

  public delete(sourceId: string) {
    return deleteSource({ sourceId }, this.requestOptions);
  }

  public async discoverSchema(sourceId: string, disableCache?: boolean) {
    const result = await discoverSchemaForSource({ sourceId, disable_cache: disableCache }, this.requestOptions);

    if (!result.jobInfo?.succeeded || !result.catalog) {
      // @ts-expect-error TODO: address this case
      const e = result.jobInfo?.logs ? new LogsRequestError(result.jobInfo) : new CommonRequestError(result);
      // Generate error with failed status and received logs
      e._status = 400;
      // @ts-expect-error address this case
      e.response = result.jobInfo;
      throw e;
    }

    return {
      catalog: result.catalog,
      jobInfo: result.jobInfo,
      catalogId: result.catalogId,
      id: sourceId,
    };
  }
}
