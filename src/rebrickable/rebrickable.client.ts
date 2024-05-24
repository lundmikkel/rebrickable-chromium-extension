import { EMPTY, Observable, expand, from, map, reduce } from "rxjs";
import {
  Part,
  PartColorSet,
  PartColors,
  getPagedResult,
  partColorSchema,
  partColorSetSchema,
  partColorsSchema,
  partSchema,
} from "./api-responses";
import { ZodTypeAny, z } from "zod";

export class RebrickableClient {
  private readonly baseUrl = "https://rebrickable.com/api/v3/lego";
  private readonly apiKey = "03075c67bbf9e33058a5335f6dcd22f9"; // TODO: Get from storage
  private readonly headers = {
    Authorization: `key ${this.apiKey}`,
    "Content-Type": "application/json",
  };

  public getPartSuggestions(partNumber: string): Observable<Part[]> {
    return this.get(
      `parts?page_size=50&ordering=part_cat_id&search=${partNumber}`,
      getPagedResult(partSchema)
    ).pipe(
      map((page) => page.results),
      map((suggestions) =>
        suggestions.sort((a, b) =>
          a.partNumber === partNumber ? -1 : b.partNumber === partNumber ? 1 : 0
        )
      )
    );
  }

  public getPartColor(partNumber: string, color: number) {
    return this.get(`parts/${partNumber}/colors/${color}/`, partColorSchema);
  }

  public getPartColorSets(partNumber: string, color: number) {
    return this.get(
      `parts/${partNumber}/colors/${color}/sets/`,
      getPagedResult(partColorSetSchema)
    ).pipe(map((page) => page.results));
  }

  public getPartColorSetsPaged(partNumber: string, color: number) {
    return this.get(
      `parts/${partNumber}/colors/${color}/sets/?pageSize=500`,
      getPagedResult(partColorSetSchema)
    ).pipe(
      expand((response) =>
        response.next
          ? this.get(
              this.getNext(response.next),
              getPagedResult(partColorSetSchema)
            )
          : EMPTY
      ),
      reduce(
        (acc, current) => acc.concat(current.results),
        [] as PartColorSet[]
      )
    );
  }

  public getPart(partNumber: string): Observable<Part> {
    return this.get(`parts/${partNumber}`, partSchema);
  }

  public getPartColors(partNumber: string): Observable<PartColors[]> {
    return this.get(
      `parts/${partNumber}/colors`,
      getPagedResult(partColorsSchema)
    ).pipe(
      map(
        (page) => page.results
        // .map((partColor) => ({ ...partColor, partNumber })),
      )
    );
  }

  private get<T extends ZodTypeAny>(
    url: string,
    schema: T
  ): Observable<z.output<T>> {
    return from(
      fetch(`${this.baseUrl}/${url}`, {
        headers: this.headers,
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json().then((data) => schema.parse(data));
      })
    );
  }

  private getNext(url: string): string {
    const startIndex = url.indexOf("lego/");
    return url.substring(startIndex + 5);
  }
}
