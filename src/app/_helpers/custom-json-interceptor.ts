import {Injectable} from "@angular/core";
import {JsonParser} from "./http.interceptor";

@Injectable()
export class CustomJsonParser implements JsonParser {
  parse(text: string): any {
    return JSON.parse(text, dateReviver);
  }
}

function dateReviver(key: string, value: any) {
  /* . . . */
}
